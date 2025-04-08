const express = require('express');
const router = express.Router();
const { verifyAndSubmitProduction, getWeatherData } = require('../oracle');

// POST /oracle/verify-production
router.post('/verify-production', async (req, res) => {
    try {
        const { producerId, location, energyType, capacityKW } = req.body;

        if (!producerId || !location || !energyType || !capacityKW) {
            return res.status(400).json({ error: 'Missing required parameters' });
        }

        const result = await verifyAndSubmitProduction(
            producerId,
            location,
            energyType,
            parseFloat(capacityKW)
        );

        res.json(result);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /oracle/weather/:location
router.get('/weather/:location', async (req, res) => {
    try {
        const weatherData = await getWeatherData(req.params.location);
        res.json(weatherData);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST /oracle/verify-energy-source
router.post('/verify-energy-source', async (req, res) => {
    try {
        const { tokenId, sourceData } = req.body;

        if (!tokenId || !sourceData) {
            return res.status(400).json({ error: 'Missing required parameters' });
        }

        // In a real implementation, this would validate the source data
        // For now, we'll just return a success message

        res.json({
            verified: true,
            tokenId,
            certifiedGreen: true
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;