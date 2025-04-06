#!/bin/bash

BASE_URL="http://localhost:3000"
TOKEN_ID="testtoken99"

echo "🔄 Cleaning up any existing token: $TOKEN_ID"
curl -s -X GET "$BASE_URL/tokens/$TOKEN_ID" > /dev/null && {
  echo "⚠️ Token already exists — skipping creation"
} || {
  echo "✅ Token does not exist — proceeding"
}

echo ""
echo "🪙 Creating new token: $TOKEN_ID"
curl -s -X POST "$BASE_URL/tokens" \
  -H "Content-Type: application/json" \
  -d "{
    \"id\": \"$TOKEN_ID\",
    \"owner\": \"userA\",
    \"producer\": \"solarfarm42\",
    \"energyAmount\": 15.5,
    \"price\": 3.25,
    \"sourceType\": \"solar\",
    \"forSale\": true,
    \"certifiedGreen\": true
}" | jq .

echo ""
echo "🔍 Fetching the token: $TOKEN_ID"
curl -s "$BASE_URL/tokens/$TOKEN_ID" | jq .

echo ""
echo "📦 Updating the token price and marking not for sale"
curl -s -X PUT "$BASE_URL/tokens/$TOKEN_ID" \
  -H "Content-Type: application/json" \
  -d '{
    "price": 4.99,
    "forSale": false
}' | jq .

echo ""
echo "📦 Attempting to transfer while not for sale (should fail)"
curl -s -X POST "$BASE_URL/tokens/$TOKEN_ID/transfer" \
  -H "Content-Type: application/json" \
  -d '{"newOwner": "userB"}' | jq .

echo ""
echo "✅ Marking token for sale"
curl -s -X PUT "$BASE_URL/tokens/$TOKEN_ID" \
  -H "Content-Type: application/json" \
  -d '{
    "forSale": true
}' | jq .

echo ""
echo "🔁 Transferring ownership to userB"
curl -s -X POST "$BASE_URL/tokens/$TOKEN_ID/transfer" \
  -H "Content-Type: application/json" \
  -d '{"newOwner": "userB"}' | jq .

echo ""
echo "🔍 Final token state:"
curl -s "$BASE_URL/tokens/$TOKEN_ID" | jq .

echo ""
echo "📋 All tokens:"
curl -s "$BASE_URL/tokens" | jq .
