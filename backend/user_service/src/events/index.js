const rabbitMQClient = require("../../../shared/rabbitmq-client");
const userCreateConsumer = require("./consumer/user-create.consumer");

async function startRabbitMQ() {
    try {
        await rabbitMQClient.connect();
        console.log("Connected to RabbitMQ");

        await rabbitMQClient.consume("user.user_created.queue", "user.user_create", userCreateConsumer.handleUserCreate);

    } catch (err) {
        console.error("Failed to connect to RabbitMQ:", err);
        process.exit(1);
    }
}

module.exports = {
    startRabbitMQ,
}
