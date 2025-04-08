# Energy Trading Platform API Documentation

## Token Endpoints

### GET /tokens
Returns a list of all energy tokens.

**Response**
```json
[
  {
    "id": "token1",
    "owner": "user1",
    "producer": "solarfarm1",
    "energyAmount": 5.5,
    "price": 2.2,
    "sourceType": "solar",
    "createdAt": "2023-01-01T00:00:00Z",
    "forSale": true,
    "certifiedGreen": true
  }
]