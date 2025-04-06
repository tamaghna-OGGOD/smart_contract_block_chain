const connect = require("./gateway");
require("dotenv").config();

async function withContract(fnName, args, isQuery = false) {
    console.log(`🔧 withContract called with fnName: ${fnName}, args: ${JSON.stringify(args)}, isQuery: ${isQuery}`);
    const gateway = await connect();

    try {
        console.log("🔗 Connected to gateway");
        const network = await gateway.getNetwork(process.env.CC_CHANNEL);
        console.log(`🌐 Retrieved network for channel: ${process.env.CC_CHANNEL}`);
        const contract = network.getContract(process.env.CC_NAME);
        console.log(`📜 Retrieved contract: ${process.env.CC_NAME}`);

        const transaction = contract.createTransaction(fnName);
        console.log(`📂 Created transaction for function: ${fnName}`);

        const endorsers = network.getChannel().getEndorsers().map(p => p.name);
        console.log("🔍 Available endorsers:", endorsers);

        if (isQuery) {
            const peer = endorsers.find(p => p.includes("org1")) || endorsers[0];
            transaction.setEndorsingPeers([peer]);
            console.log(`✅ Using peer (query): ${peer}`);
        } else {
            const peers = endorsers.filter(p => p.includes("org1") || p.includes("org2"));
            transaction.setEndorsingPeers(peers);
            console.log(`✅ Using peers (invoke): ${peers.join(", ")}`);
        }

        const result = isQuery
            ? await transaction.evaluate(...args)
            : await transaction.submit(...args);

        console.log(`🎉 Transaction ${isQuery ? "evaluated" : "submitted"} successfully`);
        return result.toString();
    } catch (err) {
        console.error(`❌ ${isQuery ? "Query" : "Invoke"} failed:`, err.message);
        throw err;
    } finally {
        console.log("🔌 Disconnecting gateway");
        await gateway.disconnect();
    }
}

async function query(functionName, args = []) {
    console.log(`🔍 Query called with functionName: ${functionName}, args: ${JSON.stringify(args)}`);
    return await withContract(functionName, args, true);
}

async function invoke(functionName, args = []) {
    console.log(`🚀 Invoke called with functionName: ${functionName}, args: ${JSON.stringify(args)}`);
    return await withContract(functionName, args, false);
}

module.exports = { query, invoke };
