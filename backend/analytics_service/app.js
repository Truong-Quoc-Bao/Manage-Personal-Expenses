const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

const express = require('express');
const app = express();
const PORT = process.env.PORT || 3004;

const connectDB = require('./src/config/database');
const rabbitMQClient = require('./src/events');
const router = require('./src/routes/analytics.routes');
// const {startGrpcServer} = require("./src/grpc/analytics.grpc");

const API_PREFIX = process.env.API_PREFIX || '';

// ── Middlewares ───────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── Routes import ─────────────────────────────
app.use(API_PREFIX, router);
// const router = require('./src/routes/analytics.routes');

// health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// ── Test API (optional) ───────────────────────
app.get('/test', (req, res) => {
  res.json({
    message: 'Analytics service is working 🚀',
  });
});

// ── Main routes ───────────────────────────────
app.use('/', router);
// routes

const startServer = async () => {
  try {
    await connectDB(); // connect Mongo trước
    await rabbitMQClient.startRabbitMQ();

    app.listen(PORT, () => {
      console.log(`Analytics service is running on port ${PORT}`);
      // startGrpcServer();
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
