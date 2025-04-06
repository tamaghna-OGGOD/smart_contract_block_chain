const fs = require("fs");
const path = require("path");
const { Wallets } = require("fabric-network");

async function main() {
    const walletPath = path.join(__dirname, "../wallet");
    const wallet = await Wallets.newFileSystemWallet(walletPath);

    const certPath = path.join(
        __dirname,
        "../../fabric-samples/test-network/organizations/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp/signcerts/cert.pem"
    );

    const keyPath = path.join(
        __dirname,
        "../../fabric-samples/test-network/organizations/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp/keystore"
    );

    const files = fs.readdirSync(keyPath);
    const privateKeyPath = path.join(keyPath, files[0]);

    const certificate = fs.readFileSync(certPath).toString();
    const privateKey = fs.readFileSync(privateKeyPath).toString();

    const identity = {
        credentials: {
            certificate,
            privateKey,
        },
        mspId: "Org1MSP",
        type: "X.509",
    };

    await wallet.put("admin", identity);
    console.log("✅ Org admin identity imported into wallet as 'admin'");
}

main();
