const prisma = require("../config/database");

const findAccountByUserId = async ({ userId }) => {
  return prisma.account.findMany({
    where: {
      user_id: userId,
    },
    select: {
      account_name: true,
      type: true,
      balance: true,
      currency: true,
      created_at: true,
      updated_at: true,
    },
  });
};
const findAccountAccountName = async ({ accountName }) => {
  return prisma.account.findFirst({
    where: {
      account_name: accountName,
    },
    select: {
      user_id: true,
      account_name: true,
      type: true,
      balance: true,
      currency: true,
      created_at: true,
      updated_at: true,
    },
  });
};

const createAccount = async ({
  userId,
  accountName,
  type,
  balance,
  currency,
}) => {
  return prisma.account.create({
    data: {
      user_id: userId,
      account_name: accountName,
      type: type,
      balance: balance,
      currency: currency,
    },
    select: {
      account_name: true,
      type: true,
      balance: true,
      currency: true,
      created_at: true,
      updated_at: true,
    },
  });
};
module.exports = {
  createAccount,
  findAccountAccountName,
  findAccountByUserId,
};
