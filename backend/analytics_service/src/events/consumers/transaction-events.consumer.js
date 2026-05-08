const service = require('../../services/analytics.service.js');

async function handleTransactionCreated(content, msg) {
    console.log(`[Analytics] Handled transaction.created for trans_id: ${content.trans_id}`);
    const result = await service.handleTransactionCreated(content);
    if (result) {
        console.log(`[Analytics] Updated analytics for account_id: ${result.account_id}`);
    } else {
        console.error(`[Analytics] Failed to process transaction.created for trans_id: ${content.trans_id}`);
    }
}

async function handleTransactionUpdated(content, msg) {
    console.log(`[Analytics] Handled transaction.updated for trans_id: ${content.trans_id}`);
    const result = await service.handleTransactionUpdated(content);
    if (result) {
        console.log(`[Analytics] Updated analytics for account_id: ${result.account_id}`);
    } else {
        console.error(`[Analytics] Failed to process transaction.updated for trans_id: ${content.trans_id}`);
    }
}

async function handleTransactionDeleted(content, msg) {
    console.log(`[Analytics] Handled transaction.deleted for trans_id: ${content.trans_id}`);
    const result = await service.handleTransactionDeleted(content);
    if (result) {
        console.log(`[Analytics] Reversed analytics for trans_id: ${result.trans_id}`);
    } else {
        console.error(`[Analytics] Failed to process transaction.deleted for trans_id: ${content.trans_id}`);
    }
}

module.exports = {
    handleTransactionCreated,
    handleTransactionUpdated,
    handleTransactionDeleted,
};





