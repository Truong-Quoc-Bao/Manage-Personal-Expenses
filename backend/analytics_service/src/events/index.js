const rabbitMQClient = require("../../../shared/rabbitmq-client");
const transactionConsumer = require("./consumers/transaction-events.consumer");
const accountConsumer = require("./consumers/account-events.consumer");
const categoryConsumer = require("./consumers/category-events.consumer");

async function startRabbitMQ() {
    try {
        await rabbitMQClient.connect();
        console.log("[Analytics] Connected to RabbitMQ");

         await rabbitMQClient.consume(
            "analytics.transaction.created.queue",
            "transaction.created",
            transactionConsumer.handleTransactionCreated
        );
        await rabbitMQClient.consume(
            "analytics.transaction.updated.queue",
            "transaction.updated",
            transactionConsumer.handleTransactionUpdated
        );
        await rabbitMQClient.consume(
            "analytics.transaction.deleted.queue",
            "transaction.deleted",
            transactionConsumer.handleTransactionDeleted
        );

         await rabbitMQClient.consume(
            "analytics.account.created.queue",
            "account.created",
            accountConsumer.handleAccountCreated
        );
        await rabbitMQClient.consume(
            "analytics.account.deleted.queue",
            "account.deleted",
            accountConsumer.handleAccountDeleted
        );

         await rabbitMQClient.consume(
            "analytics.category.created.queue",
            "category.created",
            categoryConsumer.handleCategoryCreated
        );
        await rabbitMQClient.consume(
            "analytics.category.updated.queue",
            "category.updated",
            categoryConsumer.handleCategoryUpdated
        );
        await rabbitMQClient.consume(
            "analytics.category.deleted.queue",
            "category.deleted",
            categoryConsumer.handleCategoryDeleted
        );

        console.log("[Analytics] All event consumers registered");
    } catch (err) {
        console.error("[Analytics] Failed to connect to RabbitMQ:", err);
        process.exit(1);
    }
}

module.exports = {
    startRabbitMQ,
};
