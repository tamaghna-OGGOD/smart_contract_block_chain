// createAdminUser.js
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

        // Enroll the admin user
        const enrollment = await ca.enroll({ enrollmentID: 'admin', enrollmentSecret: 'adminpw' });
        const x509Identity = {
            credentials: {
                certificate: enrollment.certificate,
                privateKey: enrollment.key.toBytes(),
            },
            mspId: process.env.ORG_MSP,
            type: 'X.509',
        };
        await wallet.put('admin', x509Identity);
        console.log('Successfully enrolled admin user "admin" and imported it into the wallet');

        // Get the CA admin client
        const provider = wallet.getProviderRegistry().getProvider(x509Identity.type);
        const adminUser = await provider.getUserContext(x509Identity, 'admin');

        // Register and enroll a new user with appropriate attributes
        const userId = 'org1admin';
        try {
            // Try to register the user
            const secret = await ca.register({
                affiliation: 'org1.department1',
                enrollmentID: userId,
                role: 'admin',  // Give admin role
                attrs: [
                    { name: 'hf.Registrar.Roles', value: 'client,user,peer' },
                    { name: 'hf.Registrar.Attributes', value: '*' },
                    { name: 'hf.Revoker', value: 'true' },
                    { name: 'hf.GenCRL', value: 'true' },
                    { name: 'admin', value: 'true:ecert' }
                ]
            }, adminUser);

            console.log(`Successfully registered user ${userId} with secret: ${secret}`);

            // Enroll the user
            const enrollment = await ca.enroll({
                enrollmentID: userId,
                enrollmentSecret: secret,
                attr_reqs: [
                    { name: 'admin', optional: false }
                ]
            });

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

            // Update .env file
            console.log('Updating .env file to use the new admin user');
            const envPath = path.resolve(__dirname, '.env');
            let envContent = fs.readFileSync(envPath, 'utf8');
            envContent = envContent.replace(/USER_ID=.*/g, `USER_ID=${userId}`);
            fs.writeFileSync(envPath, envContent);
            console.log('Updated .env file');

        } catch (error) {
            if (error.toString().includes('already registered')) {
                console.log(`User ${userId} is already registered, proceeding with enrollment`);

                // For enrollment we need the user's secret
                const secret = `${userId}pw`; // This is a guess - you might need the actual secret

                // Enroll the user
                try {
                    const enrollment = await ca.enroll({
                        enrollmentID: userId,
                        enrollmentSecret: secret,
                        attr_reqs: [
                            { name: 'admin', optional: true }
                        ]
                    });

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

                    // Update .env file
                    console.log('Updating .env file to use the new admin user');
                    const envPath = path.resolve(__dirname, '.env');
                    let envContent = fs.readFileSync(envPath, 'utf8');
                    envContent = envContent.replace(/USER_ID=.*/g, `USER_ID=${userId}`);
                    fs.writeFileSync(envPath, envContent);
                    console.log('Updated .env file');
                } catch (enrollError) {
                    console.error(`Failed to enroll user ${userId}: ${enrollError}`);
                    console.error('You might need to get the correct enrollment secret for this user');
                }
            } else {
                throw error;
            }
        }
    } catch (error) {
        console.error(`Failed to create admin user: ${error}`);
        process.exit(1);
    }
}

main();