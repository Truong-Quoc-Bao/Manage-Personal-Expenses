const rabbitMQClient = require("../../../shared/rabbitmq-client");

async function startRabbitMQ() {
    try {
        await rabbitMQClient.connect();
        console.log("Connected to RabbitMQ");
    } catch (err) {
        console.error("Failed to connect to RabbitMQ:", err);
        process.exit(1);
    }
}

module.exports = { startRabbitMQ };