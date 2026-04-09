const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

const express = require('express');
const app = express();
const PORT = process.env.PORT;

const connectDB = require('./src/config/database');
const rabbitMQClient = require('./src/events');

// ── Middlewares ───────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── Routes import ─────────────────────────────
const userAnalyticsRoutes = require('./src/routes/analytics.routes');

// health check
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});


// ── Test API (optional) ───────────────────────
app.get('/test', (req, res) => {
    res.json({
        message: 'Analytics service is working 🚀'
    });
});

// ── Main routes ───────────────────────────────
app.use("/", userAnalyticsRoutes);
// routes

const startServer = async () => {
    try {
        await connectDB(); // 👈 connect Mongo trước
        await rabbitMQClient.startRabbitMQ();

        app.listen(PORT, () => {
            console.log(`Analytics service is running on port ${PORT}`);
        });
    } catch (error) {
        console.error('Error starting server:', error);
    }
};

startServer();

// app.listen(PORT, async () => {
//     await connectDB();
//     await rabbitMQClient.startRabbitMQ();
//     console.log(`Analytics service is running on port ${PORT}`);
// });

