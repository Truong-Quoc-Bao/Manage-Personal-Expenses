const { user } = require("../config/database");
const { AccountType, CurrencyType } = require("@prisma/client");
const {
  createAccount,
  findAccountAccountName,
} = require("../repositories/account.repository");

const createNewAccount = async ({
  userId,
  accountName,
  type,
  balance,
  currency,
}) => {
  if (!userId) {
    const error = new Error("userId is required");
    error.statusCode = 400;
    throw error;
  }

  if (!accountName) {
    const error = new Error("accountName is required");
    error.statusCode = 400;
    throw error;
  }

  if (!type) {
    const error = new Error("type is required");
    error.statusCode = 400;
    throw error;
  }

  if (!balance) {
    const error = new Error("balance is required");
    error.statusCode = 400;
    throw error;
  }

  if (!currency) {
    const error = new Error("currency is required");
    error.statusCode = 400;
    throw error;
  }
  if (!String(accountName).trim()) {
    const error = new Error("accountName cannot be empty");
    error.statusCode = 400;
    throw error;
  }
  if (!Object.values(AccountType).includes(type)) {
    const error = new Error("Invalid account type");
    error.statusCode = 400;
    throw error;
  }
  if (!Object.values(CurrencyType).includes(currency)) {
    const error = new Error("Invalid currency type");
    error.statusCode = 400;
    throw error;
  }
  if (balance < 0) {
    const error = new Error("Invalid balance");
    error.statusCode = 400;
    throw error;
  }

  const existingNameAccount = await findAccountAccountName({ accountName });

  if (existingNameAccount && existingNameAccount.user_id === userId) {
    const error = new Error("Account name of this user already exists");
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

  return create;
};

module.exports = {
  createNewAccount,
};
