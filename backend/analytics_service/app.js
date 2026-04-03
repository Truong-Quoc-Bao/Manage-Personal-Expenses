const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });
const express = require('express');
const app = express();
const PORT = process.env.PORT;

const connectDB = require('./src/config/database');
const rabbitMQClient = require('./src/events');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok' });
});

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


