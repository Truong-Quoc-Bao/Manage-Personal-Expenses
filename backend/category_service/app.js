// const path = require('path');
// require('dotenv').config({ path: path.resolve(__dirname, '.env') });
// const express = require('express');
// const app = express();
// const PORT = process.env.PORT;

// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));

// app.get('/health', (req, res) => {
//     res.status(200).json({ status: 'ok' });
// });

// app.listen(PORT, () => {
//     console.log(`Category service is running on port ${PORT}`);
// });

// app.use("/", userRoutes);


const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, ".env") });
const rabbitMQClient = require("./src/events");

const express = require("express");
const app = express();
const PORT = process.env.PORT;

// import routes
const categoryRoutes = require("./src/routes/category.routes");

// middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// health check
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

// routes
app.use("/", categoryRoutes);

// start server
app.listen(PORT, async () => {
  await rabbitMQClient.startRabbitMQ();
  console.log(`Category service is running on port ${PORT}`);
});