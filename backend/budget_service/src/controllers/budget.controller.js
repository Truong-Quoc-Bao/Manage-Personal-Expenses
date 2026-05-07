const {
  getBudgetByUserIdService,
  getBudgetByBudgetIdService,
  createBudgetService,
  updateBudgetService,
  deleteBudgetService,
} = require("../services/budget.service");

const deleteBudgetController = async (req, res, next) => {
  try {
    const userId = req.user?.userId || "7cb96e5d-3cd9-40dc-ad99-635f08456301";
    const budgetId = req.params.id;

    const budgets = await deleteBudgetService({
      userId,
      budgetId,
    });

    return res.status(200).json({
      success: true,
      message: "Delete budget successfully",
    });
  } catch (error) {
    next(error);
  }
};

const updateBudgetController = async (req, res, next) => {
  try {
    const userId = req.user?.userId || "7cb96e5d-3cd9-40dc-ad99-635f08456301";
    const budgetId = req.params.id;
    const { categoryId, amountLimit, dateStart } = req.body;

    const budgets = await updateBudgetService({
      userId,
      budgetId,
      categoryId,
      amountLimit,
      dateStart,
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
    const userId = req.user?.userId || "7cb96e5d-3cd9-40dc-ad99-635f08456301";
    const { categoryId, amountLimit, dateStart } = req.body;

    const budgets = await createBudgetService({
      userId,
      categoryId,
      amountLimit,
      dateStart,
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
    const userId = req.user?.userId || "7cb96e5d-3cd9-40dc-ad99-635f08456301";
    const categoryId = req.query.categoryId;
    const dateStart = req.query.date;

    const budgets = await getBudgetByUserIdService({
      userId,
      categoryId,
      dateStart,
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
    const userId = req.user?.userId || "7cb96e5d-3cd9-40dc-ad99-635f08456301";
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
  deleteBudgetController,
};
