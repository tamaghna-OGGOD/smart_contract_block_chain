# Energy Chain Trading Platform

A blockchain-based platform for peer-to-peer energy trading using Hyperledger Fabric.

## Overview

The Energy Chain Trading Platform enables direct trading of energy between producers and consumers using tokenized energy credits. Solar farms, wind farms, and other renewable energy producers can create energy tokens that consumers can purchase directly, eliminating the need for intermediaries.

[Energy Chain Platform](https://example.com/platform-image.png)

## Features

- **Energy Token Marketplace**: Buy and sell tokenized energy credits
- **Smart Meter Integration**: Connect smart meters to generate verifiable energy production data
- **Blockchain Verification**: All transactions are recorded on Hyperledger Fabric blockchain
- **Real-time Analytics**: Monitor energy production, prices, and market trends

## Architecture

The platform uses a three-tier architecture:

1. **Frontend**: HTML/CSS/JavaScript user interface
2. **API Layer**: Node.js RESTful API
3. **Blockchain**: Hyperledger Fabric network with smart contracts

Energy producers generate tokens through verified meter readings, which are then made available on the marketplace for consumers to purchase.

## Smart Contracts

The platform uses chaincode (smart contracts) written for Hyperledger Fabric to handle:

- Token creation from verified meter readings
- Token transfers between platform participants
- Marketplace management
- Data verification

## Getting Started

### Prerequisites

- Node.js v14+
- Docker and Docker Compose
- Hyperledger Fabric v2.2+

## 🚀 1. Start the Fabric network
PS:Make sure you have linux or a wsl.
Use your custom script to boot up the test network:

```bash
cd network
./start.sh
```

This will:
- Shut down any previous network
- Start Fabric with CA and CouchDB
- Deploy the `energytrading` chaincode on `energychannel`
- Invoke `InitLedger` (optional)

---

## 🧠 2. Enroll admin + register user

Navigate to your Node.js backend directory:

```bash
cd ~/energy-trading-fabric/application/api
```

Then run:

```bash
node enrollAdmin.js
node enrollUser.js
```

This stores `admin` and `appUser` identities into the local `wallet/`.

Make sure to clear old files when you re run application.

---

## 🖥 3. Start the API server

```bash
node app.js
```

You should see:
```
API server running at http://localhost:3000
```


## Frontend
```cd frontend
http-server -p 8080```
The frontend provides an intuitive interface for:

- Browsing available energy tokens
- Managing smart meter connections
- Purchasing energy tokens
- Viewing analytics and statistics

## API Endpoints

The following RESTful API endpoints are available:

- `GET /tokens` - List all energy tokens
- `POST /tokens` - Create a new energy token
- `POST /tokens/:id/transfer` - Transfer token ownership
- `GET /meters` - List all connected smart meters
- `POST /meters/:id/generate` - Generate a reading from a meter
- `POST /meters/:id/verify` - Verify a reading and create a token
- `GET /analytics/statistics` - Get platform statistics

## Development

### Directory Structure

```
energy-trading-fabric/
├── chaincode/                 # Hyperledger Fabric smart contracts
├── network/                   # Fabric network configuration
├── application/
│   ├── api/                   # Backend API
│   │   └── app.js             # API entry point
│   └── wallet/                # Identity wallets
├── frontend/                  # User interface files
│   └── index.html             # Main HTML file
└── docs/
network/start.sh                      # Documentation
```

### Testing

Run the test suite:

```bash
npm test
```

## Security Considerations

- All meter readings are signed by the meter's private key
- Token transfers require digital signatures
- Access control is enforced through Fabric's MSP
- Data privacy is maintained through channels and private data collections

## Future Roadmap

- Dynamic pricing based on supply/demand
- Integration with grid balancing mechanisms
- Mobile app for on-the-go trading
- Support for energy futures and derivatives


## Acknowledgements

- [Hyperledger Fabric](https://www.hyperledger.org/use/fabric)
- [Power Ledger](https://www.powerledger.io/) for inspiration
- [Energy Web Foundation](https://www.energyweb.org/) for research on blockchain for energy

