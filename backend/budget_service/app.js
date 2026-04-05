const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });
const express = require('express');
const app = express();
const PORT = process.env.PORT;
// const rabbitMQClient = require('./src/events');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok' });
});

app.listen(PORT, async () => {
    // rabbitMQClient.startRabbitMQ();
    console.log(`Budget service is running on port ${PORT}`);
});