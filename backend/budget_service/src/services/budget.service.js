const { budget } = require("../config/database");
const {
  findBudgets,
  findCategoryByIdAndUserId,
  findBudgetByBudgetId,
  createBudgetId,
  findDateByCategory,
  updateBudget,
  deleteBudget,
} = require("../repositories/budget.repository");

const deleteBudgetService = async ({ userId, budgetId }) => {
  if (!userId) {
    const error = new Error("userId is required");
    error.statusCode = 400;
    throw error;
  }
  const checkBudget = await findBudgetByBudgetId({ userId, budgetId });

  if (!checkBudget) {
    const error = new Error("Budget_id is not found");
    error.statusCode = 400;
    throw error;
  }

  const budgets = await deleteBudget({ budgetId });
  return budgets;
};

const updateBudgetService = async ({
  userId,
  budgetId,
  categoryId,
  amountLimit,
  date,
}) => {
  if (!userId) {
    const error = new Error("userId is required");
    error.statusCode = 400;
    throw error;
  }
  if (!budgetId) {
    const error = new Error("budgetId is required");
    error.statusCode = 400;
    throw error;
  }
  if (!categoryId) {
    const error = new Error("category is required");
    error.statusCode = 400;
    throw error;
  }
  if (!amountLimit) {
    const error = new Error("amountLimit is required");
    error.statusCode = 400;
    throw error;
  }
  if (!date) {
    const error = new Error("date is required");
    error.statusCode = 400;
    throw error;
  }

  const checkBudget = await findBudgetByBudgetId({ userId, budgetId });

  if (!checkBudget) {
    const error = new Error("Budget_id is not found");
    error.statusCode = 400;
    throw error;
  }

  const checkCategory = await findCategoryByIdAndUserId({ categoryId, userId });

  if (!checkCategory) {
    const error = new Error("Category does not exist");
    error.statusCode = 404;
    throw error;
  }

  if (amountLimit <= 0) {
    const error = new Error("AmountLimit can not be less than 0");
    error.statusCode = 404;
    throw error;
  }

  const budgets = await updateBudget({
    userId,
    budgetId,
    categoryId,
    amountLimit,
    date,
  });
  return budgets;
};

const createBudgetService = async ({
  userId,
  categoryId,
  amountLimit,
  date,
}) => {
  if (!userId) {
    const error = new Error("userId is required");
    error.statusCode = 400;
    throw error;
  }
  if (!categoryId) {
    const error = new Error("category is required");
    error.statusCode = 400;
    throw error;
  }
  if (!amountLimit) {
    const error = new Error("amountLimit is required");
    error.statusCode = 400;
    throw error;
  }
  if (!date) {
    const error = new Error("date is required");
    error.statusCode = 400;
    throw error;
  }

  const category = await findCategoryByIdAndUserId({ categoryId, userId });

  if (!category) {
    const error = new Error("Category does not exist");
    error.statusCode = 404;
    throw error;
  }

  const checkDate = await findDateByCategory({ userId, categoryId, date });

  if (checkDate) {
    const error = new Error("this Budget is set today");
    error.statusCode = 404;
    throw error;
  }

  const budget = await createBudgetId({
    userId,
    categoryId,
    amountLimit,
    date,
  });
  return budget;
};

const getBudgetByBudgetIdService = async ({ userId, budgetId }) => {
  if (!userId) {
    const error = new Error("userId is required");
    error.statusCode = 400;
    throw error;
  }
  const budgets = await findBudgetByBudgetId({ userId, budgetId });
  return budgets;
};

const getBudgetByUserIdService = async ({ userId, categoryId, date }) => {
  if (!userId) {
    const error = new Error("userId is required");
    error.statusCode = 400;
    throw error;
  }

  if (categoryId) {
    const category = await findCategoryByIdAndUserId({ categoryId, userId });

    if (!category) {
      const error = new Error("Category does not exist");
      error.statusCode = 404;
      throw error;
    }
  }

  const budgets = await findBudgets({ userId, categoryId, date });

  return budgets;
};
module.exports = {
  getBudgetByUserIdService,
  getBudgetByBudgetIdService,
  createBudgetService,
  updateBudgetService,
  deleteBudgetService,
};
