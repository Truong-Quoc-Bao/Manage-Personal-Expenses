const accountRepository = require("../repositories/account.repository");

async function handleTransactionCreated(message) {
    const transaction = message;

    const account = await accountRepository.findAccountByAccountId({ accountId: transaction.account_id });
    if (transaction.transaction_type === "Expense") {
        account.balance = Number(account.balance) - Number(transaction.amount);
    }else if (transaction.transaction_type === "Income") {
        account.balance = Number(account.balance) + Number(transaction.amount);
    }
    console.log(`Updated balance for account_id ${account.account_id}: ${account.balance}`);
    return await accountRepository.updateAccountBalance({ accountId: account.account_id, balance: account.balance });
}

module.exports = {
    handleTransactionCreated
};
