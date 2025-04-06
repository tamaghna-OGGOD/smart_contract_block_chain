# Energy Trading Blockchain Application: Setup and Testing Notes

## Overview
This document summarizes the steps taken to deploy and test an energy trading application on Hyperledger Fabric. The application consists of:
1. A chaincode written in Go that manages energy tokens on the blockchain
2. A Node.js API server that interfaces with the blockchain network
3. A REST API for client applications to interact with the energy trading platform

## Steps Completed

### 1. Deploying the Chaincode
The chaincode was written in Go and deployed to the Hyperledger Fabric test network. The chaincode file is located at:
```
energy-trading-fabric/fabric-samples/chaincode/energy-trading/energy-trading.go
```

### 2. Testing the Chaincode with CLI

#### Set Environment Variables
```bash
echo 'export PATH=$PATH:$HOME/energy-trading-fabric/fabric-samples/bin' >> ~/.bashrc
echo 'export FABRIC_CFG_PATH=$HOME/energy-trading-fabric/fabric-samples/config' >> ~/.bashrc
echo 'export CORE_PEER_TLS_ENABLED=true' >> ~/.bashrc
echo 'export CORE_PEER_LOCALMSPID="Org1MSP"' >> ~/.bashrc
echo 'export CORE_PEER_TLS_ROOTCERT_FILE=$HOME/energy-trading-fabric/fabric-samples/test-network/organizations/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt' >> ~/.bashrc
echo 'export CORE_PEER_MSPCONFIGPATH=$HOME/energy-trading-fabric/fabric-samples/test-network/organizations/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp' >> ~/.bashrc
echo 'export CORE_PEER_ADDRESS=localhost:7051' >> ~/.bashrc
source ~/.bashrc

```

#### Initialize the Ledger
```bash
peer chaincode invoke -o localhost:7050 --ordererTLSHostnameOverride orderer.example.com --tls --cafile $HOME/energy-trading-fabric/fabric-samples/test-network/organizations/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem -C energychannel -n energytrading --peerAddresses localhost:7051 --tlsRootCertFiles $HOME/energy-trading-fabric/fabric-samples/test-network/organizations/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt --peerAddresses localhost:9051 --tlsRootCertFiles $HOME/energy-trading-fabric/fabric-samples/test-network/organizations/peerOrganizations/org2.example.com/peers/peer0.org2.example.com/tls/ca.crt -c '{"function":"InitLedger","Args":[]}'
```
Response: `Chaincode invoke successful. result: status:200`

#### Query All Tokens
```bash
peer chaincode query -C energychannel -n energytrading -c '{"function":"GetAllTokens","Args":[]}'
```
Response: Two tokens were created (token1 and token2).

#### Create a New Token
```bash
peer chaincode invoke -o localhost:7050 --ordererTLSHostnameOverride orderer.example.com --tls --cafile $HOME/energy-trading-fabric/fabric-samples/test-network/organizations/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem -C energychannel -n energytrading --peerAddresses localhost:7051 --tlsRootCertFiles $HOME/energy-trading-fabric/fabric-samples/test-network/organizations/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt --peerAddresses localhost:9051 --tlsRootCertFiles $HOME/energy-trading-fabric/fabric-samples/test-network/organizations/peerOrganizations/org2.example.com/peers/peer0.org2.example.com/tls/ca.crt -c '{"function":"CreateToken","Args":["token3", "user3", "hydroplant1", "4.5", "1.8", "hydro", "true", "true"]}'
```
Response: `Chaincode invoke successful. result: status:200`

#### Read a Specific Token
```bash
peer chaincode query -C energychannel -n energytrading -c '{"function":"ReadToken","Args":["token3"]}'
```
Response: Details of token3 were returned.

#### Get Tokens by Owner
```bash
peer chaincode query -C energychannel -n energytrading -c '{"function":"GetTokensByOwner","Args":["user1"]}'
```
Response: List of tokens owned by user1.

#### Update a Token
```bash
peer chaincode invoke -o localhost:7050 --ordererTLSHostnameOverride orderer.example.com --tls --cafile $HOME/energy-trading-fabric/fabric-samples/test-network/organizations/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem -C energychannel -n energytrading --peerAddresses localhost:7051 --tlsRootCertFiles $HOME/energy-trading-fabric/fabric-samples/test-network/organizations/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt --peerAddresses localhost:9051 --tlsRootCertFiles $HOME/energy-trading-fabric/fabric-samples/test-network/organizations/peerOrganizations/org2.example.com/peers/peer0.org2.example.com/tls/ca.crt -c '{"function":"UpdateToken","Args":["token2", "", "2.0", "true"]}'
```
Response: `Chaincode invoke successful. result: status:200`

#### Transfer a Token
```bash
peer chaincode invoke -o localhost:7050 --ordererTLSHostnameOverride orderer.example.com --tls --cafile $HOME/energy-trading-fabric/fabric-samples/test-network/organizations/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem -C energychannel -n energytrading --peerAddresses localhost:7051 --tlsRootCertFiles $HOME/energy-trading-fabric/fabric-samples/test-network/organizations/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt --peerAddresses localhost:9051 --tlsRootCertFiles $HOME/energy-trading-fabric/fabric-samples/test-network/organizations/peerOrganizations/org2.example.com/peers/peer0.org2.example.com/tls/ca.crt -c '{"function":"TransferToken","Args":["token1", "user4"]}'
```
Response: `Chaincode invoke successful. result: status:200`

#### Verify Token Transfer
```bash
peer chaincode query -C energychannel -n energytrading -c '{"function":"ReadToken","Args":["token1"]}'
```
Response: Owner of token1 was changed to user4.

#### Check if Token Exists
```bash
peer chaincode query -C energychannel -n energytrading -c '{"function":"TokenExists","Args":["token3"]}'
```
Response: `true`

### 3. Setting Up the API Server

#### Create Wallet Directory
```bash
mkdir -p application/api/wallet
```

#### Run the API Server
```bash
cd ~/energy-trading-fabric/application/api
node app.js
```
Output: `Energy Trading API server running on port 3000`

### 4. Fixing Certificate Path Issues

The API server was looking for certificates in a different path than where they were located. The following commands were used to fix the issue:

```bash
# Clean up existing directory structure
rm -rf ~/energy-trading-fabric/network/test-network/organizations/peerOrganizations
rm -rf ~/energy-trading-fabric/network/test-network/organizations/ordererOrganizations

# Create the correct structure
mkdir -p ~/energy-trading-fabric/network/test-network/organizations/
cp -r ~/energy-trading-fabric/fabric-samples/test-network/organizations/peerOrganizations ~/energy-trading-fabric/network/test-network/organizations/
cp -r ~/energy-trading-fabric/fabric-samples/test-network/organizations/ordererOrganizations ~/energy-trading-fabric/network/test-network/organizations/

# Find the keystore file name
KEYFILE=$(ls ~/energy-trading-fabric/fabric-samples/test-network/organizations/peerOrganizations/org1.example.com/users/User1@org1.example.com/msp/keystore/)

# Create directories for certificate links
mkdir -p ~/energy-trading-fabric/network/test-network/organizations/peerOrganizations/org1.example.com/users/User1@org1.example.com/msp/keystore/
mkdir -p ~/energy-trading-fabric/network/test-network/organizations/peerOrganizations/org1.example.com/users/User1@org1.example.com/msp/signcerts/

# Create symbolic links with expected names
ln -sf ~/energy-trading-fabric/fabric-samples/test-network/organizations/peerOrganizations/org1.example.com/users/User1@org1.example.com/msp/keystore/$KEYFILE ~/energy-trading-fabric/network/test-network/organizations/peerOrganizations/org1.example.com/users/User1@org1.example.com/msp/keystore/key.pem

ln -sf ~/energy-trading-fabric/fabric-samples/test-network/organizations/peerOrganizations/org1.example.com/users/User1@org1.example.com/msp/signcerts/User1@org1.example.com-cert.pem ~/energy-trading-fabric/network/test-network/organizations/peerOrganizations/org1.example.com/users/User1@org1.example.com/msp/signcerts/cert.pem

# Copy connection profile files
cp ~/energy-trading-fabric/fabric-samples/test-network/organizations/peerOrganizations/org1.example.com/connection-org1.json ~/energy-trading-fabric/network/test-network/organizations/peerOrganizations/org1.example.com/
cp ~/energy-trading-fabric/fabric-samples/test-network/organizations/peerOrganizations/org2.example.com/connection-org2.json ~/energy-trading-fabric/network/test-network/organizations/peerOrganizations/org2.example.com/
```

### 5. Testing the API

#### Get All Tokens
```bash
curl -X GET http://localhost:3000/api/tokens
```
Response: List of all tokens in the ledger.

## Additional API Endpoints to Test

#### Create a New Token via API
```bash
curl -X POST http://localhost:3000/api/tokens \
  -H "Content-Type: application/json" \
  -d '{
    "id": "token4",
    "owner": "user3",
    "producer": "solarfarm2",
    "energyAmount": 2.5,
    "price": 1.75,
    "sourceType": "solar",
    "forSale": true,
    "certifiedGreen": true
  }'
```

#### Get a Specific Token
```bash
curl -X GET http://localhost:3000/api/tokens/token1
```

#### Update a Token
```bash
curl -X PUT http://localhost:3000/api/tokens/token2 \
  -H "Content-Type: application/json" \
  -d '{
    "price": 2.5,
    "forSale": true
  }'
```

#### Transfer a Token
```bash
curl -X POST http://localhost:3000/api/tokens/token2/transfer \
  -H "Content-Type: application/json" \
  -d '{
    "newOwner": "user5"
  }'
```

#### Get Tokens by Owner
```bash
curl -X GET http://localhost:3000/api/tokens/owner/user3
```

## Current State of the Application

The energy trading application now has:

1. **Functioning Chaincode**: Successfully deployed to the Fabric network with all core functions working
2. **API Server**: Running and correctly connecting to the blockchain network
3. **REST API**: Available for client applications to interact with the blockchain

The application allows for:
- Creating new energy tokens
- Querying tokens by ID or owner
- Updating token properties (price, for sale status)
- Transferring tokens between owners

# Energy Trading Blockchain Application: Enhanced Setup and Testing Notes

## Additional Work Completed 

### 6. Frontend Application Setup

We created a React-based frontend application to provide a user-friendly interface for interacting with the energy trading blockchain. This section details the steps taken to set up and configure the frontend.

#### Creating the Frontend Application Structure
```bash
# Navigate to project directory
cd ~/energy-trading-fabric

# Create a new React application
npx create-react-app energy-trading-frontend

# Navigate to the new React app
cd energy-trading-frontend

# Install required dependencies (compatible with Node.js v16)
npm install axios react-bootstrap bootstrap react-router-dom@6.3.0
```

#### Configuring CORS for API Server
To allow cross-origin requests from the frontend to the API server, we added CORS middleware to the API server:

```bash
# Install CORS package in the API folder
cd ~/energy-trading-fabric/application/api
npm install cors

# Update app.js to include CORS middleware
# Added the following code to app.js:
const cors = require('cors');
app.use(cors());
```

#### Enhanced API Error Handling and Logging
We significantly improved the API server's error handling and logging capabilities to aid in debugging and development:

- Added detailed logging for connection process
- Enhanced error reporting for all endpoints
- Improved data validation for incoming requests
- Added better type handling for blockchain transactions
- Implemented a health check endpoint at the root path

#### Setting Up React Components
We created the following React components for the frontend:
- **Navigation**: App navigation menu
- **Dashboard**: Overview of token statistics
- **TokenList**: Display and filter all available tokens
- **TokenDetails**: View and manage individual token properties
- **CreateToken**: Form interface for creating new energy tokens
- **MyTokens**: User-specific view of owned tokens

#### Running the Applications
Due to port conflicts between the API server and React development server, we:
1. Kept the API server running on port 3000
2. Configured the React app to run on port 3001

```bash
# Terminal 1: Run the API with enhanced error logging
cd ~/energy-trading-fabric/application/api
node app.js

# Terminal 2: Run the React app on port 3001
cd ~/energy-trading-fabric/energy-trading-frontend
PORT=3001 npm start
```

### 7. Troubleshooting Blockchain Interactions

We encountered and resolved several issues during the integration of the frontend with the blockchain:

#### Endorsement Policy Issues
When creating tokens through the API, we encountered endorsement policy errors:
```
Failed to create token: Error: No valid responses from any peers. Errors:
peer=undefined, status=grpc, message=Peer endorsements do not match
```

We implemented detailed logging to trace the issue and made the following improvements:
- Added parameter validation
- Properly formatted and converted data types for chaincode parameters
- Enhanced error logging to capture detailed transaction failures
- Implemented better state checking for token operations

#### Node.js Version Compatibility
The project was developed on Node.js v16.20.2, which required adjustments to package versions:
- Used React Router v6.3.0 instead of v7.x for compatibility
- Modified React component code to work with the compatible router version
- Addressed npm warnings about engine compatibility

### 8. Frontend Features

The frontend application now includes:

1. **Interactive Dashboard**
   - Displays token statistics categorized by energy source
   - Shows the number of tokens for sale and green-certified tokens
   - Quick access to token creation and browsing

2. **Token Marketplace**
   - Lists all available energy tokens with filtering options
   - Visual indicators for token status (for sale, green certified)
   - Energy source icons for quick visual identification

3. **Token Management**
   - Detailed view of individual token properties
   - Controls to mark tokens for sale/not for sale
   - Price update functionality
   - Transfer ownership interface

4. **User-Specific Views**
   - Filter tokens by owner
   - Personalized dashboard for owned tokens
   - Streamlined token management for users

### 9. End-to-End Testing

We performed end-to-end testing of the complete application stack:

1. **Blockchain Layer**
   - Verified chaincode functions work correctly
   - Confirmed data persistence across transactions
   - Tested endorsement policies

2. **API Layer**
   - Validated all endpoints return correct data
   - Confirmed proper error handling
   - Tested concurrency and load handling

3. **Frontend Layer**
   - Verified all components render correctly
   - Tested user interactions (create, update, transfer)
   - Confirmed responsive design works on different screen sizes

## Current State of the Application

The energy trading application now has:

1. **Complete Blockchain Backend**: Hyperledger Fabric network with energy trading chaincode
2. **Feature-Rich API**: RESTful endpoints with enhanced error handling and logging
3. **Intuitive Frontend**: React-based user interface for interacting with the blockchain
4. **Full System Integration**: End-to-end workflow from UI to blockchain and back

## Next Steps

1. **Enhanced Authentication**: Implement user authentication and authorization
2. **Real-time Updates**: Add WebSocket support for real-time token status changes
3. **Advanced Trading Features**: Implement bidding, auctions, and automated matching
4. **Analytics Dashboard**: Add data visualization for energy trading activity
5. **Mobile Optimization**: Further enhance the responsive design for mobile users
6. **Production Deployment**: Configure for production environment with proper security

## Conclusion

The energy trading platform now provides a complete solution for tokenizing and trading renewable energy certificates on a blockchain. The application demonstrates how distributed ledger technology can create transparent, secure, and efficient energy markets while promoting renewable energy adoption through certification tracking.