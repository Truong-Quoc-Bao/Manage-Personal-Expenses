const service = require('../../services/analytics.service.js');

async function handleTransactionCreated(content, msg) {
    console.log(`Handled transaction created event for transaction_id: ${content.trans_id}`);
    const user_id = "4f4b144d-e3f8-4e6b-9e32-408030a85698";
    const result = await service.handleTransactionCreated({ ...content, user_id });
    if (result) {
        console.log(`Updated account balance for account_id: ${result.account_id}, new balance: ${result.balance}`);
    }
    else {
        console.error(`Failed to update account balance for transaction_id: ${content.transaction_id}`);
    }
}

async function handleTransactionUpdated(content, msg) {
    console.log(`Handled transaction updated event for transaction_id: ${content.trans_id}`);
    const user_id = "4f4b144d-e3f8-4e6b-9e32-408030a85698";
    const result = await service.handleTransactionUpdated({ ...content, user_id });
    if (result) {
        console.log(`Updated account balance for account_id: ${result.account_id}, new balance: ${result.balance}`);
    }
    else {
        console.error(`Failed to update account balance for transaction_id: ${content.transaction_id}`);
    }
}

async function handleTransactionDeleted(content, msg) {
     content.trans_id = "7887d351-6ce1-4e2b-9c14-8190d3db9710";

    console.log(`Handled transaction deleted event for transaction_id: ${content.trans_id}`);

    const user_id = "4f4b144d-e3f8-4e6b-9e32-408030a85698";
    const result = await service.handleTransactionDeleted({ ...content, user_id });
    if (result) {
        console.log(`Updated account balance for account_id: ${result.account_id}, new balance: ${result.balance}`);
    }
    else {
        console.error(`Failed to update account balance for transaction_id: ${content.transaction_id}`);
    }
}

module.exports = {
    handleTransactionCreated,
    handleTransactionUpdated
};





