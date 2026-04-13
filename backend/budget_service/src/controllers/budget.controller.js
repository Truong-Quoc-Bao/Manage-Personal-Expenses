const {
  getBudgetByUserIdService,
  getBudgetByBudgetIdService,
  createBudgetService,
} = require("../services/budget.service");

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
    const budgetId = req.query.budgetId;

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
};
