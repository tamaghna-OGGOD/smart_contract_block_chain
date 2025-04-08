// enrollUser.js
const { Wallets } = require('fabric-network');
const FabricCAServices = require('fabric-ca-client');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function main() {
    try {
        // Load the connection profile
        const ccpPath = path.resolve(__dirname, process.env.CONNECTION_PROFILE);
        const ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));

        // Create a new CA client for interacting with the CA
        const caInfo = ccp.certificateAuthorities['ca.org1.example.com'];
        const caTLSCACerts = caInfo.tlsCACerts.pem || fs.readFileSync(path.resolve(__dirname, caInfo.tlsCACerts.path), 'utf8');
        const ca = new FabricCAServices(caInfo.url, { trustedRoots: caTLSCACerts, verify: false }, caInfo.caName);

        // Create a new wallet for managing identities
        const walletPath = path.join(__dirname, process.env.WALLET_PATH);
        const wallet = await Wallets.newFileSystemWallet(walletPath);
        console.log(`Wallet path: ${walletPath}`);

        // Check if we already have the user identity in the wallet
        const userId = process.env.USER_ID;
        const userIdentity = await wallet.get(userId);
        if (userIdentity) {
            console.log(`An identity for the user "${userId}" already exists in the wallet`);
            console.log('Removing existing identity to re-enroll');
            await wallet.remove(userId);
        }

        // We need the enrollment secret for the user
        console.log('Please enter the enrollment secret for the user:');
        // This is usually provided when the user was first registered
        // For testing, you can try common default values like 'pw' or userId + 'pw'
        // Or you might need to get it from your Fabric administrator

        // For this script, we'll use a default value, but in production you should prompt for it
        const enrollmentSecret = `${userId}pw`; // or another default value you may have used
        console.log(`Using enrollment secret: ${enrollmentSecret}`);

        // Enroll the user with the CA
        console.log(`Enrolling user ${userId}`);
        const enrollment = await ca.enroll({
            enrollmentID: userId,
            enrollmentSecret: enrollmentSecret
        });

        // Import the new identity into the wallet
        const x509Identity = {
            credentials: {
                certificate: enrollment.certificate,
                privateKey: enrollment.key.toBytes(),
            },
            mspId: process.env.ORG_MSP,
            type: 'X.509',
        };
        await wallet.put(userId, x509Identity);
        console.log(`Successfully enrolled user "${userId}" and imported it into the wallet`);

    } catch (error) {
        console.error(`Failed to enroll user "${process.env.USER_ID}": ${error}`);
        process.exit(1);
    }
}

main();