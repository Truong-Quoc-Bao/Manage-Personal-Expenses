const accountRepository = require("../repositories/account.repository");

async function handleTransactionCreated(message) {
    const transaction = message;

    const account = await accountRepository.findAccountByAccountId({ accountId: transaction.account_id });
    if (transaction.transaction_type === "Expense") {
        account.balance = Number(account.balance) - Number(transaction.amount);
    } else if (transaction.transaction_type === "Income") {
        account.balance = Number(account.balance) + Number(transaction.amount);
    }
    console.log(`Updated balance for account_id ${account.account_id}: ${account.balance}`);
    return await accountRepository.updateAccountBalance({ accountId: account.account_id, balance: account.balance });
}

async function handleTransactionUpdated(message) {
    const transaction = message;

    const account = await accountRepository.findAccountByAccountId({ accountId: transaction.account_id });

    if (transaction.TransactionType === "Expense") {
        account.balance = Number(account.balance) + Number(transaction.Amount);
    } else if (transaction.TransactionType === "Income") {
        account.balance = Number(account.balance) - Number(transaction.Amount);
    }

    const newAmount = transaction.AmountUpdate !== undefined ? transaction.AmountUpdate : transaction.Amount;
    const newType = transaction.TransactionTypeUpdate || transaction.TransactionType;

    if (newType === "Expense") {
        account.balance = Number(account.balance) - Number(newAmount);
    } else if (newType === "Income") {
        account.balance = Number(account.balance) + Number(newAmount);
    }

    return await accountRepository.updateAccountBalance({ accountId: account.account_id, balance: account.balance });
}

async function handleTransactionDeleted(message) {
    const transaction = message;

    const account = await accountRepository.findAccountByAccountId({ accountId: transaction.account_id });
    if (transaction.transaction_type === "Expense") {
        account.balance = Number(account.balance) + Number(transaction.amount);
    } else if (transaction.transaction_type === "Income") {
        account.balance = Number(account.balance) - Number(transaction.amount);
    }
    console.log(`Updated balance for account_id ${account.account_id}: ${account.balance}`);
    return await accountRepository.updateAccountBalance({ accountId: account.account_id, balance: account.balance });
}

module.exports = {
    handleTransactionCreated,
    handleTransactionUpdated,
    handleTransactionDeleted
};
