const axios = require('axios');

class SmartMeter {
    constructor(meterId, location, type, capacity) {
        this.meterId = meterId;
        this.location = location;
        this.type = type; // 'solar', 'wind', etc.
        this.capacity = capacity; // in kW
        this.readings = [];
    }

    // Simulate a meter reading
    generateReading() {
        // Get current time
        const timestamp = new Date().toISOString();

        // Simulate energy production based on time of day and some randomness
        let production = 0;
        const hour = new Date().getHours();

        if (this.type === 'solar') {
            // Solar produces more during daylight hours
            if (hour >= 6 && hour <= 18) {
                // Peak at noon
                const peakFactor = 1 - Math.abs(hour - 12) / 6;
                production = this.capacity * peakFactor * (0.7 + Math.random() * 0.3);
            } else {
                production = 0; // No solar at night
            }
        } else if (this.type === 'wind') {
            // Wind can produce at any time, but with more variation
            production = this.capacity * (0.3 + Math.random() * 0.7);
        }

        // Round to 2 decimal places
        production = Math.round(production * 100) / 100;

        const reading = {
            timestamp,
            energyKWh: production,
            meterId: this.meterId
        };

        this.readings.push(reading);
        return reading;
    }

    // Send reading to oracle service
    async sendReadingToOracle() {
        const reading = this.generateReading();

        try {
            const response = await axios.post('http://localhost:3000/oracle/verify-production', {
                producerId: this.meterId,
                location: this.location,
                energyType: this.type,
                capacityKW: this.capacity
            });

            return {
                reading,
                verificationResult: response.data
            };
        } catch (error) {
            console.error('Error sending reading to oracle:', error);
            throw error;
        }
    }

    // Get all readings
    getAllReadings() {
        return this.readings;
    }
}

// Create a few sample meters
const meters = {
    'solar-farm-001': new SmartMeter('solar-farm-001', 'California', 'solar', 50),
    'wind-farm-001': new SmartMeter('wind-farm-001', 'Texas', 'wind', 30),
    'solar-farm-002': new SmartMeter('solar-farm-002', 'Arizona', 'solar', 40)
};

module.exports = {
    SmartMeter,
    meters,
    // Function to get a specific meter
    getMeter: (id) => meters[id],
    // Function to get all meters
    getAllMeters: () => Object.values(meters)
};