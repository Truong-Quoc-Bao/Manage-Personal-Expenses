const {
  createNewAccount,
  getAccountsServices,
} = require("../services/account.service");

const getAccountsController = async (req, res, next) => {
  try {
    const userId = req.user?.userId || req.query.userId;

    const getAccount = await getAccountsServices({ userId });

    return res.status(200).json({
      success: true,
      message: "Get accounts successfully",
      data: getAccount,
    });
  } catch (error) {
    next(error);
  }
};

const CreateAccount = async (req, res, next) => {
  try {
    const userId = req.user?.userId || req.query.userId;

    const { accountName, type, balance, currency } = req.body;

    const create = await createNewAccount({
      userId,
      accountName,
      type,
      balance,
      currency,
    });

    return res.status(200).json({
      success: true,
      message: "Created account successfully",
      data: create,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { CreateAccount, getAccountsController };
