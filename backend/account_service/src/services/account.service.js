const { user } = require('../config/database');
const { AccountType, CurrencyType } = require('@prisma/client');
const {
  createAccount,
  findAccountAccountName,
  findAccountByUserId,
  updateAccountRepo,
  findAccountByAccountId,
  deleteAccountRepo,
  findTotalByUserId,
} = require('../repositories/account.repository');

const accountRepository = require('../repositories/account.repository');
const rabbitMQClient = require('../../../shared/rabbitmq-client');

const getTotalBalanceService = async ({ userId }) => {
  if (!userId) {
    const error = new Error('userId is required');
    error.statusCode = 400;
    throw error;
  }

  const accounts = await findTotalByUserId({ userId });

  const totalBalance = accounts.reduce((sum, account) => {
    return sum + Number(account.balance || 0);
  }, 0);

  return {
    user_id: userId,
    total_balance: totalBalance,
    accounts,
  };
};

const deleteAccountServices = async ({ accountId }) => {
  if (!accountId) {
    const error = new Error('accountId is required');
    error.statusCode = 400;
    throw error;
  }

  const accountInfo = await findAccountByAccountId({ accountId });
  const deleteAccount = await deleteAccountRepo({ accountId });

  if (accountInfo) {
    try {
      await rabbitMQClient.publish('account.deleted', {
        account_id: accountId,
        user_id: accountInfo.user_id,
        account_name: accountInfo.account_name,
      });
    } catch (err) {
      console.error('[Account] Failed to publish account.deleted:', err.message);
    }
  }

  return deleteAccount;
};

const updateAccountServices = async ({ userId, accountId, accountName, type }) => {
  if (!accountId) {
    const error = new Error('accountId is required');
    error.statusCode = 400;
    throw error;
  }
  if (accountName === undefined && type === undefined) {
    const error = new Error('At least one field (accountName or type) is required');
    error.statusCode = 400;
    throw error;
  }

  if (accountName !== undefined) {
    if (accountName === null || !String(accountName).trim()) {
      const error = new Error('accountName cannot be empty');
      error.statusCode = 400;
      throw error;
    }
    const existingNameAccount = await findAccountAccountName({
      accountName,
      userId,
    });

    if (existingNameAccount) {
      const error = new Error('Account name of this user already exists');
      error.statusCode = 400;
      throw error;
    }
  }

  if (type !== undefined) {
    if (!Object.values(AccountType).includes(type)) {
      const error = new Error('Invalid account type');
      error.statusCode = 400;
      throw error;
    }
  }

  const AccountUnique = await findAccountByAccountId({ accountId });

  if (!AccountUnique) {
    const error = new Error('account not found');
    error.statusCode = 404;
    throw error;
  }

  if (AccountUnique.user_id !== userId) {
    const error = new Error('You do not have permission to update this account');
    error.statusCode = 403;
    throw error;
  }

  const updateAccount = await updateAccountRepo({
    accountId,
    accountName,
    type,
  });

  return updateAccount;
};

const getAccountsServices = async ({ userId }) => {
  if (!userId) {
    const error = new Error('userId is required');
    error.statusCode = 400;
    throw error;
  }

  const accounts = await findAccountByUserId({ userId });

  return accounts;
};

const createNewAccount = async ({ userId, accountName, type, balance, currency }) => {
  if (!userId) {
    const error = new Error('userId is required');
    error.statusCode = 400;
    throw error;
  }

  if (!accountName) {
    const error = new Error('accountName is required');
    error.statusCode = 400;
    throw error;
  }

  if (!type) {
    const error = new Error('type is required');
    error.statusCode = 400;
    throw error;
  }

  // if (!balance) {
  //   const error = new Error('balance is required');
  //   error.statusCode = 400;
  //   throw error;
  // }

  // Chỉ báo lỗi nếu thực sự bỏ trống (undefined hoặc null), còn số 0 thì cho qua
  if (balance === undefined || balance === null) {
    const error = new Error('balance is required');
    error.statusCode = 400;
    throw error;
  }

  if (!currency) {
    const error = new Error('currency is required');
    error.statusCode = 400;
    throw error;
  }
  if (!String(accountName).trim()) {
    const error = new Error('accountName cannot be empty');
    error.statusCode = 400;
    throw error;
  }
  if (!Object.values(AccountType).includes(type)) {
    const error = new Error('Invalid account type');
    error.statusCode = 400;
    throw error;
  }
  if (!Object.values(CurrencyType).includes(currency)) {
    const error = new Error('Invalid currency type');
    error.statusCode = 400;
    throw error;
  }
  if (balance < 0) {
    const error = new Error('Invalid balance');
    error.statusCode = 400;
    throw error;
  }

  const existingNameAccount = await findAccountAccountName({
    accountName,
    userId,
  });

  if (existingNameAccount) {
    const error = new Error('Account name of this user already exists');
    error.statusCode = 400;
    throw error;
  }

  const create = await createAccount({
    userId,
    accountName,
    type,
    balance,
    currency,
  });

  try {
    await rabbitMQClient.publish('account.created', {
      account_id: create.account_id,
      user_id: userId,
      account_name: accountName,
      type,
      balance,
      currency,
    });
  } catch (err) {
    console.error('[Account] Failed to publish account.created:', err.message);
  }

  return create;
};

const checkExistAccount = async (accountId, userId) => {
  const account = await accountRepository.findAccountForTransactionCheck({ accountId, userId });
  return !!account;
};

const getAccountDisplayService = async (accountId, userId) => {
  const account = await accountRepository.findAccountByAccountId({ accountId });
  if (!account || account.user_id !== userId) {
    return { found: false, account_name: '' };
  }
  return { found: true, account_name: account.account_name || '' };
};

module.exports = {
  createNewAccount,
  getAccountsServices,
  updateAccountServices,
  deleteAccountServices,
  getTotalBalanceService,
  checkExistAccount,
  getAccountDisplayService,
};
