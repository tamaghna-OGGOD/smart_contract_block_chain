Absolutely — here’s a clean **project-level documentation** you can drop into `README.md` or use for onboarding.

---

# ⚡ Energy Trading Fabric API – Setup & Usage Guide

This project provides a Node.js backend API for interacting with a Hyperledger Fabric smart contract that manages energy tokens.

---

## 📁 Project Structure

```
energy-trading-fabric/
├── application/
│   ├── api/                  # Node.js backend (Express + Fabric SDK)
│   │   ├── app.js
│   │   ├── chaincode.js
│   │   ├── gateway.js
│   │   ├── enrollAdmin.js
│   │   ├── registerUser.js
│   │   ├── routes/
│   │   │   └── tokenRoutes.js
│   │   ├── wallet/           # Local identity store (admin, appUser)
│   │   └── .env
│   └── gateway/
│       └── connection-org1.json
├── chaincode/
│   └── energy-trading/       # Go chaincode
│       └── token.go
└── fabric-samples/
    └── test-network/
        └── start.sh          # ✅ Used to start the network
```

---

## 🚀 1. Start the Fabric network

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
node registerUser.js
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

---

## 🌐 4. Available REST API Endpoints

| Method | Endpoint                         | Description                      |
|--------|----------------------------------|----------------------------------|
| GET    | `/tokens`                        | Get all tokens                   |
| GET    | `/tokens/:id`                    | Get a specific token             |
| POST   | `/tokens`                        | Create a new token               |
| PUT    | `/tokens/:id`                    | Update a token (price/sale)      |
| POST   | `/tokens/:id/transfer`           | Transfer token ownership         |

---

## 📦 Example Token Creation

```bash
curl -X POST http://localhost:3000/tokens \
  -H "Content-Type: application/json" \
  -d '{
    "id": "testtoken99",
    "owner": "user99",
    "producer": "windfarm99",
    "energyAmount": 10.5,
    "price": 3.2,
    "sourceType": "wind",
    "forSale": true,
    "certifiedGreen": true
}'
```

---

## ⚙️ .env configuration

Inside `application/api/.env`:

```env
USER_ID=appUser
WALLET_PATH=../wallet
CONNECTION_PROFILE=../gateway/connection-org1.json
CC_CHANNEL=energychannel
CC_NAME=energytrading
PORT=3000
```

---

## ✅ Prerequisites

- Node.js ≥ 16.x
- Docker & Docker Compose
- Hyperledger Fabric binaries + images (already part of `fabric-samples`)
- Fabric CA enabled via `start.sh` (uses `-ca` flag)

---
