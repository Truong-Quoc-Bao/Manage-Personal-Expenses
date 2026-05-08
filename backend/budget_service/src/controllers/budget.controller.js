const {
  getBudgetByUserIdService,
  getBudgetByBudgetIdService,
  createBudgetService,
  updateBudgetService,
  deleteBudgetService,
} = require("../services/budget.service");

function requireUserId(req, res) {
  const userId = req.headers['x-user-id'];
  if (userId == null || userId === "") {
    res.status(401).json({ success: false, message: "Unauthorized" });
    return null;
  }
  return String(userId);
}

const deleteBudgetController = async (req, res, next) => {
  try {
    const userId = requireUserId(req, res);
    if (!userId) return;
    const budgetId = req.params.id;

    await deleteBudgetService({
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
    const userId = requireUserId(req, res);
    if (!userId) return;
    const budgetId = req.params.id;

    const { title, categoryId, amountLimit, dateStart } = req.body;

    const budgets = await updateBudgetService({
      userId,
      budgetId,
      title,
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
    const userId = requireUserId(req, res);
    if (!userId) return;

    const { title, categoryId, amountLimit, dateStart } = req.body;

    const budgets = await createBudgetService({
      userId,
      title,
      categoryId,
      amountLimit,
      dateStart,
    });

    return res.status(201).json({
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
    const userId = requireUserId(req, res);
    if (!userId) return;

    const { categoryId, dateStart } = req.query;

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
    const userId = requireUserId(req, res);
    if (!userId) return;
    const budgetId = req.params.id;

    const budgets = await getBudgetByBudgetIdService({
      userId,
      budgetId,
    });

    return res.status(200).json({
      success: true,
      message: "Get budget successfully",
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
