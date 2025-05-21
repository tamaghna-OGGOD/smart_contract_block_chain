const axios = require('axios');

const API_URL = 'http://localhost:3000';

async function runTests() {
    console.log('=== Running Energy Trading Platform Tests ===');
    try {
        // Test get all tokens
        console.log('\nTesting GET /tokens');
        const tokensResponse = await axios.get(`${API_URL}/tokens`);
        console.log(`Status: ${tokensResponse.status}`);
        console.log(`Tokens found: ${tokensResponse.data.length}`);
        
        // Test create token
        console.log('\nTesting POST /tokens');
        const newToken = {
            id: `test_token_${Date.now()}`,
            owner: 'testuser',
            producer: 'testproducer',
            energyAmount: 5.0,
            price: 2.5,
            sourceType: 'solar',
            forSale: true,
            certifiedGreen: true
        };
        
        const createResponse = await axios.post(`${API_URL}/tokens`, newToken);
        console.log(`Status: ${createResponse.status}`);
        console.log(`Success: ${createResponse.data.success}`);
        
        // Test oracle verification
        console.log('\nTesting POST /oracle/verify-production');
        const oracleData = {
            producerId: 'testproducer',
            location: 'Test Location',
            energyType: 'solar',
            capacityKW: 30
        };
        
        const oracleResponse = await axios.post(`${API_URL}/oracle/verify-production`, oracleData);
        console.log(`Status: ${oracleResponse.status}`);
        console.log(`Token ID: ${oracleResponse.data.tokenId}`);
        console.log(`Estimated Production: ${oracleResponse.data.estimatedProduction} kWh`);
        
        // Test analytics
        console.log('\nTesting GET /analytics/statistics');
        const statsResponse = await axios.get(`${API_URL}/analytics/statistics`);
        console.log(`Status: ${statsResponse.status}`);
        console.log(`Total Tokens: ${statsResponse.data.totalTokens}`);
        console.log(`Average Price: $${statsResponse.data.averagePrice.toFixed(2)}`);
        
        console.log('\n=== All tests completed successfully ===');
    } catch (error) {
        console.error('\n=== Test Failed ===');
        console.error(`Error: ${error.message}`);
        if (error.response) {
            console.error(`Status: ${error.response.status}`);
            console.error(`Response: ${JSON.stringify(error.response.data)}`);
        }
    }
}

runTests();