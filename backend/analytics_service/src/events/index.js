const rabbitMQClient = require('../../../shared/rabbitmq-client');
const transactionConsumer = require('./consumers/transaction-events.consumer');
const accountConsumer = require('./consumers/account-events.consumer');
const categoryConsumer = require('./consumers/category-events.consumer');
const budgetConsumer = require('./consumers/budget-events.consumer');

async function startRabbitMQ() {
  try {
    console.log('STEP 1');

    await rabbitMQClient.connect();

    console.log('STEP 2');
    console.log('[Analytics] Connected to RabbitMQ');

    await rabbitMQClient.consume(
      'analytics.transaction.created.queue',
      'transaction.created',
      transactionConsumer.handleTransactionCreated,
    );
    await rabbitMQClient.consume(
      'analytics.transaction.updated.queue',
      'transaction.updated',
      transactionConsumer.handleTransactionUpdated,
    );
    await rabbitMQClient.consume(
      'analytics.transaction.deleted.queue',
      'transaction.deleted',
      transactionConsumer.handleTransactionDeleted,
    );

    await rabbitMQClient.consume(
      'analytics.account.created.queue',
      'account.created',
      accountConsumer.handleAccountCreated,
    );
    await rabbitMQClient.consume(
      'analytics.account.deleted.queue',
      'account.deleted',
      accountConsumer.handleAccountDeleted,
    );

    await rabbitMQClient.consume(
      'analytics.category.created.queue',
      'category.created',
      categoryConsumer.handleCategoryCreated,
    );
    await rabbitMQClient.consume(
      'analytics.category.updated.queue',
      'category.updated',
      categoryConsumer.handleCategoryUpdated,
    );
    await rabbitMQClient.consume(
      'analytics.category.deleted.queue',
      'category.deleted',
      categoryConsumer.handleCategoryDeleted,
    );

    await rabbitMQClient.consume(
      'analytics.budget.created.queue',
      'budget.created',
      budgetConsumer.handleBudgetCreated,
    );
    await rabbitMQClient.consume(
      'analytics.budget.updated.queue',
      'budget.updated',
      budgetConsumer.handleBudgetUpdated,
    );
    await rabbitMQClient.consume(
      'analytics.budget.deleted.queue',
      'budget.deleted',
      budgetConsumer.handleBudgetDeleted,
    );

    console.log('[Analytics] All event consumers registered');
  } catch (err) {
    console.error('[Analytics] Failed to connect to RabbitMQ:', err);
    process.exit(1);
  }
}

module.exports = {
  startRabbitMQ,
};
