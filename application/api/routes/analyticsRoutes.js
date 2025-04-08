const express = require('express');
const router = express.Router();
const { getTokenStatistics, predictFutureProduction } = require('../analytics');

// GET /analytics/statistics
router.get('/statistics', async (req, res) => {
    try {
        const stats = await getTokenStatistics();
        res.json(stats);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /analytics/predictions
router.get('/predictions', (req, res) => {
    try {
        const days = req.query.days ? parseInt(req.query.days) : 7;
        const predictions = predictFutureProduction(days);
        res.json(predictions);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /analytics/production-by-source
router.get('/production-by-source', async (req, res) => {
    try {
        const stats = await getTokenStatistics();

        // Transform energyBySource object into an array format for charts
        const productionBySource = Object.entries(stats.energyBySource).map(([source, amount]) => ({
            source,
            amount
        }));

        res.json(productionBySource);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;