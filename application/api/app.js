// const express = require("express");
// const tokenRoutes = require("./routes/tokenRoutes");
// require("dotenv").config();

// const app = express();
// app.use(express.json());

// console.log("Middleware for JSON parsing added.");

// app.use("/tokens", (req, res, next) => {
//     console.log(`Incoming request to /tokens - Method: ${req.method}, Path: ${req.path}`);
//     next();
// }, tokenRoutes);

// const PORT = process.env.PORT || 3000;
// app.listen(PORT, () => {
//     console.log(`API server running at http://localhost:${PORT}`);
// });

const express = require("express");
const tokenRoutes = require("./routes/tokenRoutes");
require("dotenv").config();

const app = express();

// Basic middleware
app.use(express.json());

// CORS middleware
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");

    // Handle preflight requests
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }
    next();
});

console.log("Middleware for JSON parsing added.");

// Routes
app.use("/tokens", (req, res, next) => {
    console.log(`Incoming request to /tokens - Method: ${req.method}, Path: ${req.path}`);
    next();
}, tokenRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error("API Error:", err);
    res.status(500).json({ error: err.message || "Server error" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`API server running at http://localhost:${PORT}`);
});
