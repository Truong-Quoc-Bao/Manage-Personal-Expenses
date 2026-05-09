const service = require('../../services/analytics.service.js');

async function handleTransactionCreated(content, msg) {
    console.log(`[Analytics][transaction.created] Received event for trans_id: ${content.trans_id}`);
    console.log(`[Analytics][transaction.created] Payload:`, JSON.stringify(content, null, 2));
    try {
        const result = await service.handleTransactionCreated(content);
        if (result) {
            console.log(`[Analytics][transaction.created] SUCCESS | trans_id: ${result.trans_id}, account_id: ${result.account_id}`);
        } else {
            console.error(`[Analytics][transaction.created] FAILED (returned null) | trans_id: ${content.trans_id}`);
        }
    } catch (err) {
        console.error(`[Analytics][transaction.created] ERROR | trans_id: ${content.trans_id}`, err.message, err.stack);
    }
}

async function handleTransactionUpdated(content, msg) {
    console.log(`[Analytics][transaction.updated] Received event for trans_id: ${content.trans_id}`);
    console.log(`[Analytics][transaction.updated] Payload:`, JSON.stringify(content, null, 2));
    try {
        const result = await service.handleTransactionUpdated(content);
        if (result) {
            console.log(`[Analytics][transaction.updated] SUCCESS | trans_id: ${result.trans_id}, account_id: ${result.account_id}`);
        } else {
            console.error(`[Analytics][transaction.updated] FAILED (returned null) | trans_id: ${content.trans_id}`);
        }
    } catch (err) {
        console.error(`[Analytics][transaction.updated] ERROR | trans_id: ${content.trans_id}`, err.message, err.stack);
    }
}

async function handleTransactionDeleted(content, msg) {
    console.log(`[Analytics][transaction.deleted] Received event for trans_id: ${content.trans_id}`);
    console.log(`[Analytics][transaction.deleted] Payload:`, JSON.stringify(content, null, 2));
    try {
        const result = await service.handleTransactionDeleted(content);
        if (result) {
            console.log(`[Analytics][transaction.deleted] SUCCESS | trans_id: ${result.trans_id}, account_id: ${result.account_id}`);
        } else {
            console.error(`[Analytics][transaction.deleted] FAILED (returned null) | trans_id: ${content.trans_id}`);
        }
    } catch (err) {
        console.error(`[Analytics][transaction.deleted] ERROR | trans_id: ${content.trans_id}`, err.message, err.stack);
    }
}

module.exports = {
    handleTransactionCreated,
    handleTransactionUpdated,
    handleTransactionDeleted,
};





