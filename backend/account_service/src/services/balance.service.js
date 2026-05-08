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

function reverseBalanceForType(balance, amount, transactionType) {
    const n = Number(amount);
    if (transactionType === "Expense") return balance + n;
    if (transactionType === "Income") return balance - n;
    return balance;
}

function applyBalanceForType(balance, amount, transactionType) {
    const n = Number(amount);
    if (transactionType === "Expense") return balance - n;
    if (transactionType === "Income") return balance + n;
    return balance;
}

async function handleTransactionUpdated(message) {
    const oldAccountId = message.account_id;
    const newAccountId = message.account_id_update ?? message.account_id;

    const oldAmount = Number(message.amount);
    const oldType = message.transaction_type;
    const newAmount =
        message.amount_update !== undefined && message.amount_update !== null
            ? Number(message.amount_update)
            : oldAmount;
    const newType = message.transaction_type_update ?? oldType;

    if (oldAccountId === newAccountId) {
        const account = await accountRepository.findAccountByAccountId({ accountId: oldAccountId });
        let balance = Number(account.balance);
        balance = reverseBalanceForType(balance, oldAmount, oldType);
        balance = applyBalanceForType(balance, newAmount, newType);
        return await accountRepository.updateAccountBalance({
            accountId: account.account_id,
            balance,
        });
    }

    const oldAccount = await accountRepository.findAccountByAccountId({ accountId: oldAccountId });
    const oldBal = reverseBalanceForType(Number(oldAccount.balance), oldAmount, oldType);
    await accountRepository.updateAccountBalance({
        accountId: oldAccountId,
        balance: oldBal,
    });

    const newAccount = await accountRepository.findAccountByAccountId({ accountId: newAccountId });
    const newBal = applyBalanceForType(Number(newAccount.balance), newAmount, newType);
    return await accountRepository.updateAccountBalance({
        accountId: newAccountId,
        balance: newBal,
    });
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
