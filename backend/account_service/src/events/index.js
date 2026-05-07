const rabbitMQClient = require("../../../shared/rabbitmq-client");
const transactionCreatedConsumer = require("./consumers/transaction_created.consumer");
const transactionUpdatedConsumer = require("./consumers/transaction_updated.consumer");
const transactionDeletedConsumer = require("./consumers/transaction_deleted.consumer");

async function startRabbitMQ() {
    try {
        await rabbitMQClient.connect();
        console.log("Connected to RabbitMQ");

        await rabbitMQClient.consume("account.transaction.created.queue", "transaction.created", transactionCreatedConsumer.handleTransactionCreated);
        await rabbitMQClient.consume("account.transaction.updated.queue", "transaction.updated", transactionUpdatedConsumer.handleTransactionUpdated);
        await rabbitMQClient.consume("account.transaction.deleted.queue", "transaction.deleted", transactionDeletedConsumer.handleTransactionDeleted);

    } catch (err) {
        console.error("Failed to connect to RabbitMQ:", err);
        process.exit(1);
    }
}

module.exports = { startRabbitMQ };