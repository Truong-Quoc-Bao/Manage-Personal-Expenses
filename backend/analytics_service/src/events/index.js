const rabbitMQClient = require("../../../shared/rabbitmq-client");
const transactionCreatedConsumer = require("./consumers/transaction-events.consumer");
const transactionUpdatedConsumer = require("./consumers/transaction-events.consumer");
const transactionDeletedConsumer = require("./consumers/transaction-events.consumer");
async function startRabbitMQ() {
    try {
        await rabbitMQClient.connect();
        console.log("Connected to RabbitMQ");

        // console.log("📩 Received message:", msg.content.toString());

        await rabbitMQClient.consume("analytics.transaction.created.queue", "transaction.created", transactionCreatedConsumer.handleTransactionCreated);
        await rabbitMQClient.consume("analytics.transaction.updated.queue", "transaction.updated", transactionUpdatedConsumer.handleTransactionUpdated);
        await rabbitMQClient.consume("analytics.transaction.deleted.queue", "transaction.deleted", transactionDeletedConsumer.handleTransactionDeleted);

    } catch (err) {
        console.error("Failed to connect to RabbitMQ:", err);
        process.exit(1);
    }
}

module.exports = {
    startRabbitMQ,
}



