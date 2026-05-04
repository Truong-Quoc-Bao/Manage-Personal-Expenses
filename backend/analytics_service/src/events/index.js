const rabbitMQClient = require("../../../shared/rabbitmq-client");
const transactionCreatedConsumer = require("./consumers/transaction-events.consumer");
// const transactionUpdatedConsumer = require("./consumers/transaction-events.comsumer");
async function startRabbitMQ() {
    try {
        await rabbitMQClient.connect();
        console.log("Connected to RabbitMQ");

        // console.log("📩 Received message:", msg.content.toString());

        await rabbitMQClient.consume("transaction.created.queue", "transaction.created", transactionCreatedConsumer.handleTransactionCreated);
        // await rabbitMQClient.consume("transaction.updated.queue", "transaction.updated", transactionUpdatedConsumer.handleTransactionUpdated);

    } catch (err) {
        console.error("Failed to connect to RabbitMQ:", err);
        process.exit(1);
    }
}

module.exports = {
    startRabbitMQ,
}



