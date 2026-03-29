const {
  createNewAccount,
  getAccountsServices,
  updateAccountServices,
  deleteAccountServices,
} = require("../services/account.service");

const deleteAccountController = async (req, res, next) => {
  try {
    const accountId = req.query.accountId;

    const deleteAccount = await deleteAccountServices({ accountId });

    return res.status(200).json({
      success: true,
      message: "delete account successfully",
    });
  } catch (error) {
    next(error);
  }
};

const updateAccountController = async (req, res, next) => {
  try {
    const accountId = req.query.accountId;

    const userId = req.user?.userId || req.query.userId;

    const { accountName, type } = req.body;

    const updateAccount = await updateAccountServices({
      userId,
      accountId,
      accountName,
      type,
    });

    return res.status(200).json({
      success: true,
      message: "Update account successfully",
      data: updateAccount,
    });
  } catch (error) {
    next(error);
  }
};

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

module.exports = {
  CreateAccount,
  getAccountsController,
  updateAccountController,
  deleteAccountController,
};
