const rabbitMQClient = require("../../../shared/rabbitmq-client");
const { handleTransactionCreated } = require("./consumers/transaction-created.consumer");
const { handleTransactionUpdated } = require("./consumers/transaction-updated.consumer");
const { handleTransactionDeleted } = require("./consumers/transaction-deleted.consumer");

async function startRabbitMQ() {
  try {
    await rabbitMQClient.connect();
    console.log("[Budget] Connected to RabbitMQ");

    await rabbitMQClient.consume(
      "budget.transaction.created.queue",
      "transaction.created",
      handleTransactionCreated
    );

    await rabbitMQClient.consume(
      "budget.transaction.updated.queue",
      "transaction.updated",
      handleTransactionUpdated
    );

    await rabbitMQClient.consume(
      "budget.transaction.deleted.queue",
      "transaction.deleted",
      handleTransactionDeleted
    );

    console.log("[Budget] All transaction consumers registered");
  } catch (err) {
    console.error("[Budget] Failed to connect to RabbitMQ:", err.message);
  }
}

module.exports = { startRabbitMQ };
