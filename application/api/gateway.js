const path = require("path");
const { Wallets, Gateway } = require("fabric-network");
const fs = require("fs");
require("dotenv").config();

console.log("Starting gateway.js...");

async function connect() {
    console.log("Initializing connection...");

    const ccpPath = path.resolve(__dirname, process.env.CONNECTION_PROFILE);
    console.log("Connection profile path:", ccpPath);
    const ccp = JSON.parse(fs.readFileSync(ccpPath, "utf8"));

    const walletPath = path.resolve(__dirname, process.env.WALLET_PATH);
    console.log("Wallet path:", walletPath);
    const wallet = await Wallets.newFileSystemWallet(walletPath);
    console.log("Wallet initialized.");

    const userId = process.env.USER_ID;
    console.log("Checking for identity:", userId);
    const identity = await wallet.get(userId);
    if (!identity) {
        console.error("App user not found in wallet");
        throw new Error("App user not found in wallet");
    }
    console.log("Identity found:", userId);

    const gateway = new Gateway();
    console.log("Connecting to gateway...");
    await gateway.connect(ccp, {
        wallet,
        identity: userId,
        discovery: {
            enabled: true,          // ✅ turn discovery ON
            asLocalhost: true       // ✅ required for localhost setup
        }
    });
    console.log("Gateway connected successfully.");

    return gateway;
}

module.exports = connect;