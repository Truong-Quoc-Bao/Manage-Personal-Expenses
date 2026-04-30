const rabbitMQClient = require("../../../shared/rabbitmq-client");
const transactionCreatedConsumer = require("./consumers/transaction_created.consumer");

async function startRabbitMQ() {
    try {
        await rabbitMQClient.connect();
        console.log("Connected to RabbitMQ");

        await rabbitMQClient.consume("transaction.created.queue", "transaction.created", transactionCreatedConsumer.handleTransactionCreated);
    } catch (err) {
        console.error("Failed to connect to RabbitMQ:", err);
        process.exit(1);
    }
}

module.exports = { startRabbitMQ };