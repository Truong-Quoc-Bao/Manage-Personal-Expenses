const {
  getBudgetByUserIdService,
  getBudgetByBudgetIdService,
  createBudgetService,
  updateBudgetService,
} = require("../services/budget.service");

const updateBudgetController = async (req, res, next) => {
  try {
    const userId = req.user?.userId || req.query.userId;
    const budgetId = req.params.id;
    const { categoryId, amountLimit, date } = req.body;

    const budgets = await updateBudgetService({
      userId,
      budgetId,
      categoryId,
      amountLimit,
      date,
    });

    return res.status(200).json({
      success: true,
      message: "Update budgets successfully",
      data: budgets,
    });
  } catch (error) {
    next(error);
  }
};

const createBudgetController = async (req, res, next) => {
  try {
    const userId = req.user?.userId || req.query.userId;
    const { categoryId, amountLimit, date } = req.body;

    const budgets = await createBudgetService({
      userId,
      categoryId,
      amountLimit,
      date,
    });

    return res.status(200).json({
      success: true,
      message: "Create budgets successfully",
      data: budgets,
    });
  } catch (error) {
    next(error);
  }
};

const getBudgetByUserIdController = async (req, res, next) => {
  try {
    const userId = req.user?.userId || req.query.userId;
    const categoryId = req.query.categoryId;
    const date = req.query.date;

    const budgets = await getBudgetByUserIdService({
      userId,
      categoryId,
      date,
    });

    return res.status(200).json({
      success: true,
      message: "Get budgets successfully",
      data: budgets,
    });
  } catch (error) {
    next(error);
  }
};
const getBudgetByBudgetIdController = async (req, res, next) => {
  try {
    const userId = req.user?.userId || req.query.userId;
    const budgetId = req.params.id;

    const budgets = await getBudgetByBudgetIdService({
      userId,
      budgetId,
    });

    return res.status(200).json({
      success: true,
      message: "Get budgets successfully",
      data: budgets,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getBudgetByUserIdController,
  getBudgetByBudgetIdController,
  createBudgetController,
  updateBudgetController,
};
