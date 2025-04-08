const express = require("express");
const cors = require("cors");
const tokenRoutes = require("./routes/tokenRoutes");
const oracleRoutes = require("./routes/oracleRoutes");
const meterRoutes = require("./routes/meterRoutes");
const analyticsRoutes = require("./routes/analyticsRoutes");
require("dotenv").config();

const app = express();

// Basic middleware
app.use(express.json());
app.use(cors());

console.log("Middleware for JSON parsing added.");

// Define logger middleware
const loggerMiddleware = (req, res, next) => {
    console.log(`Incoming request to ${req.path} - Method: ${req.method}`);
    next();
};

// Routes
app.use("/tokens", loggerMiddleware, tokenRoutes);
app.use("/oracle", loggerMiddleware, oracleRoutes);
app.use("/meters", loggerMiddleware, meterRoutes);
app.use("/analytics", loggerMiddleware, analyticsRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error("API Error:", err);
    res.status(500).json({ error: err.message || "Server error" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`API server running at http://localhost:${PORT}`);
});