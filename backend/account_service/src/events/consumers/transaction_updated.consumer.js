const balanceService = require('../../services/balance.service');

async function handleTransactionUpdated(content, msg) {
    console.log(`Handled transaction updated event for transaction_id: ${content.trans_id}`);
    const result = await balanceService.handleTransactionUpdated(content);
    if (result) {
        console.log(`Updated account balance for account_id: ${result.account_id}, new balance: ${result.balance}`);
    }
    else {
        console.error(`Failed to update account balance for transaction_id: ${content.transaction_id}`);
    }
}

module.exports = {
    handleTransactionUpdated
};
