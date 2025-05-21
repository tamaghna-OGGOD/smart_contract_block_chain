#!/bin/bash
set -e  # Exit on first error

# 📁 Set Fabric environment variables
export PATH=$PATH:$HOME/energy-trading-fabric/fabric-samples/bin
export FABRIC_CFG_PATH=$HOME/energy-trading-fabric/fabric-samples/config

echo "📁 FABRIC_CFG_PATH is set to: $FABRIC_CFG_PATH"
echo "🛠 PATH includes: $(which peer)"
echo "📂 Working in $(pwd)"

# 📍 Navigate to the test-network
cd $HOME/energy-trading-fabric/fabric-samples/test-network

# 🚫 Safety check
if [ ! -f "./network.sh" ]; then
    echo "❌ Error: network.sh not found in $(pwd)"
    exit 1
fi

# 🛑 Shut down any running network
echo "🛑 Shutting down existing Fabric network..."
./network.sh down

# 🚀 Start network with CA & CouchDB, create 'energychannel'
echo "🚀 Starting Fabric network with CA and CouchDB..."
./network.sh up createChannel -ca -s couchdb -c energychannel

# 📦 Ensure chaincode is available in the correct path
CHAINCODE_SRC="$HOME/energy-trading-fabric/chaincode/energy-trading"
CHAINCODE_DEST="$HOME/energy-trading-fabric/fabric-samples/chaincode/energy-trading"

if [ ! -d "$CHAINCODE_DEST" ]; then
    echo "📦 Copying chaincode to fabric-samples..."
    mkdir -p "$CHAINCODE_DEST"
    cp -r "$CHAINCODE_SRC"/* "$CHAINCODE_DEST/"
fi

# 🛠 Deploy chaincode
echo "🛠 Deploying chaincode 'energytrading' on channel 'energychannel'..."
./network.sh deployCC -c energychannel -ccn energytrading -ccp ../chaincode/energy-trading -ccl go

# ⏳ Wait for Org1 peer readiness
echo "⏳ Waiting for peer0.org1.example.com to be ready..."
until docker exec peer0.org1.example.com peer node status &>/dev/null; do
  sleep 1
done
echo "✅ peer0.org1.example.com is up!"

# 👤 Set CLI context to Org1 Admin
export CORE_PEER_LOCALMSPID=Org1MSP
export CORE_PEER_MSPCONFIGPATH=$HOME/energy-trading-fabric/fabric-samples/test-network/organizations/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp
export CORE_PEER_ADDRESS=localhost:7051
export CORE_PEER_TLS_ROOTCERT_FILE=$HOME/energy-trading-fabric/fabric-samples/test-network/organizations/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt

# 🧠 Init ledger from both Org1 and Org2
echo "📦 Seeding ledger via InitLedger on both Org1 and Org2 peers..."
peer chaincode invoke \
  -o localhost:7050 \
  --ordererTLSHostnameOverride orderer.example.com \
  --tls \
  --cafile $HOME/energy-trading-fabric/fabric-samples/test-network/organizations/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem \
  -C energychannel \
  -n energytrading \
  --peerAddresses localhost:7051 \
  --tlsRootCertFiles $CORE_PEER_TLS_ROOTCERT_FILE \
  --peerAddresses localhost:9051 \
  --tlsRootCertFiles $HOME/energy-trading-fabric/fabric-samples/test-network/organizations/peerOrganizations/org2.example.com/peers/peer0.org2.example.com/tls/ca.crt \
  -c '{"function":"InitLedger","Args":[]}'

# 🧪 Optional: verify tokens exist
echo "🔍 Verifying ledger with GetAllTokens..."
peer chaincode query \
  -C energychannel \
  -n energytrading \
  -c '{"function":"GetAllTokens","Args":[]}'

echo ""
echo "✅ Fabric network is ready!"
echo "🧠 Chaincode 'energytrading' deployed on 'energychannel'"
echo "📦 Ledger initialized with demo tokens"
