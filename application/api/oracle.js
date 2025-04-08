const axios = require('axios');
const { invoke } = require('./chaincode');

// Simulated weather API for energy prediction
async function getWeatherData(location) {
    try {
        // In production, replace with an actual weather API call
        // const response = await axios.get(`https://api.weatherapi.com/v1/current.json?key=${process.env.WEATHER_API_KEY}&q=${location}`);
        // return response.data;

        // Simulated response
        return {
            current: {
                temp_c: 22,
                condition: { text: 'Sunny' },
                wind_kph: 15,
                cloud: 10
            }
        };
    } catch (error) {
        console.error('Error fetching weather data:', error);
        throw error;
    }
}

// Function to estimate solar energy production based on weather
function estimateSolarProduction(weatherData, capacity) {
    const cloudCover = weatherData.current.cloud / 100; // 0-1 scale
    const sunlight = 1 - cloudCover;

    // Simple model: full capacity on perfectly sunny days, reduced by cloud cover
    return capacity * sunlight;
}

// Function to estimate wind energy production
function estimateWindProduction(weatherData, capacity) {
    const windSpeed = weatherData.current.wind_kph;

    // Simple model: wind turbines need minimum wind speed to generate
    if (windSpeed < 10) {
        return capacity * (windSpeed / 20); // Partial production below optimal
    } else if (windSpeed > 50) {
        return 0; // Too windy, turbines would shut down
    } else {
        return capacity; // Optimal production
    }
}

// Oracle service that verifies and submits energy production data
async function verifyAndSubmitProduction(producerId, location, energyType, capacityKW) {
    try {
        const weatherData = await getWeatherData(location);
        let estimatedProduction = 0;

        if (energyType === 'solar') {
            estimatedProduction = estimateSolarProduction(weatherData, capacityKW);
        } else if (energyType === 'wind') {
            estimatedProduction = estimateWindProduction(weatherData, capacityKW);
        }

        // Round to 2 decimal places
        estimatedProduction = Math.round(estimatedProduction * 100) / 100;

        // Create a token based on verified production
        const tokenId = `token_${producerId}_${Date.now()}`;

        await invoke('CreateToken', [
            tokenId,
            producerId,
            producerId,
            estimatedProduction.toString(),
            (estimatedProduction * 0.15).toString(), // Example price calculation
            energyType,
            'true', // For sale
            'true'  // Certified green
        ]);

        return {
            tokenId,
            estimatedProduction,
            weatherCondition: weatherData.current.condition.text
        };
    } catch (error) {
        console.error('Oracle verification failed:', error);
        throw error;
    }
}

module.exports = {
    verifyAndSubmitProduction,
    getWeatherData
};