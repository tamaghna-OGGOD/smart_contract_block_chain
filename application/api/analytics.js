const { query } = require('./chaincode');

async function getTokenStatistics() {
    try {
        const tokensJson = await query('GetAllTokens', []);
        const tokens = JSON.parse(tokensJson);

        // Calculate total energy by source
        const energyBySource = tokens.reduce((acc, token) => {
            if (!acc[token.sourceType]) {
                acc[token.sourceType] = 0;
            }
            acc[token.sourceType] += token.energyAmount;
            return acc;
        }, {});

        // Calculate average price
        const totalPrice = tokens.reduce((sum, token) => sum + token.price, 0);
        const averagePrice = tokens.length > 0 ? totalPrice / tokens.length : 0;

        // Count tokens for sale
        const tokensForSale = tokens.filter(token => token.forSale).length;

        // Total energy
        const totalEnergy = tokens.reduce((sum, token) => sum + token.energyAmount, 0);

        return {
            totalTokens: tokens.length,
            tokensForSale,
            totalEnergy,
            averagePrice,
            energyBySource
        };
    } catch (error) {
        console.error('Error in analytics:', error);
        throw error;
    }
}

// Function to simulate future energy production based on historical data
function predictFutureProduction(days = 7) {
    // This would normally use a real prediction model based on AI/ML
    // For now, just returning simulated data

    const predictions = {
        solar: [],
        wind: [],
        hydro: []
    };

    const today = new Date();

    for (let i = 0; i < days; i++) {
        const date = new Date(today);
        date.setDate(date.getDate() + i);

        // Generate some realistic-looking predictions with an upward trend and weekly patterns
        const dayOfWeek = date.getDay();
        const weekendFactor = (dayOfWeek === 0 || dayOfWeek === 6) ? 0.8 : 1.0;

        predictions.solar.push({
            date: date.toISOString().split('T')[0],
            production: Math.round((65 + i * 2 + Math.random() * 15) * weekendFactor)
        });

        predictions.wind.push({
            date: date.toISOString().split('T')[0],
            production: Math.round((45 + i * 1.5 + Math.random() * 20) * weekendFactor)
        });

        predictions.hydro.push({
            date: date.toISOString().split('T')[0],
            production: Math.round((30 + i * 1 + Math.random() * 10) * weekendFactor)
        });
    }

    return predictions;
}

module.exports = {
    getTokenStatistics,
    predictFutureProduction
};