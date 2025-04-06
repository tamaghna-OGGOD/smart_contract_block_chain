const express = require("express");
const router = express.Router();
const { invoke, query } = require("../chaincode");

// GET /tokens
router.get("/", async (req, res) => {
    try {
        const result = await query("GetAllTokens", []);
        res.json(JSON.parse(result));
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /tokens/:id
router.get("/:id", async (req, res) => {
    try {
        const result = await query("ReadToken", [req.params.id]);
        res.json(JSON.parse(result));
    } catch (err) {
        res.status(404).json({ error: err.message });
    }
});

// POST /tokens
router.post("/", async (req, res) => {
    const {
        id, owner, producer, energyAmount,
        price, sourceType, forSale, certifiedGreen,
    } = req.body;

    try {
        const result = await invoke("CreateToken", [
            id,
            owner,
            producer,
            energyAmount.toString(),
            price.toString(),
            sourceType,
            forSale.toString(),
            certifiedGreen.toString(),
        ]);
        res.json({ success: true, result });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// PUT /tokens/:id
router.put("/:id", async (req, res) => {
    const { owner, price, forSale } = req.body;

    try {
        const result = await invoke("UpdateToken", [
            req.params.id,
            owner || "",
            price?.toString() || "0",
            forSale?.toString() || "false"
        ]);
        res.json({ success: true, result });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST /tokens/:id/transfer
router.post("/:id/transfer", async (req, res) => {
    const { newOwner } = req.body;
    if (!newOwner) return res.status(400).json({ error: "newOwner required" });

    try {
        const result = await invoke("TransferToken", [
            req.params.id,
            newOwner
        ]);
        res.json({ success: true, result });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
