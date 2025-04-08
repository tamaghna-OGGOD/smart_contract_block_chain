const express = require('express');
const router = express.Router();
const { meters, getMeter, getAllMeters } = require('../smartMeter');

// GET /meters
router.get('/', (req, res) => {
    try {
        const meterList = getAllMeters().map(meter => ({
            id: meter.meterId,
            location: meter.location,
            type: meter.type,
            capacity: meter.capacity
        }));

        res.json(meterList);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /meters/:id
router.get('/:id', (req, res) => {
    try {
        const meter = getMeter(req.params.id);
        if (!meter) {
            return res.status(404).json({ error: 'Meter not found' });
        }

        res.json({
            id: meter.meterId,
            location: meter.location,
            type: meter.type,
            capacity: meter.capacity,
            readings: meter.getAllReadings()
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST /meters/:id/generate
router.post('/:id/generate', (req, res) => {
    try {
        const meter = getMeter(req.params.id);
        if (!meter) {
            return res.status(404).json({ error: 'Meter not found' });
        }

        const reading = meter.generateReading();
        res.json(reading);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST /meters/:id/verify
router.post('/:id/verify', async (req, res) => {
    try {
        const meter = getMeter(req.params.id);
        if (!meter) {
            return res.status(404).json({ error: 'Meter not found' });
        }

        const result = await meter.sendReadingToOracle();
        res.json(result);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Bulk generate readings for all meters
router.post('/generate-all', (req, res) => {
    try {
        const results = getAllMeters().map(meter => {
            return {
                meterId: meter.meterId,
                reading: meter.generateReading()
            };
        });

        res.json(results);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;