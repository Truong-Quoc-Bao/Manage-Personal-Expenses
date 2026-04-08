const { budget } = require("../config/database");
const {
  findBudgets,
  findCategoryByIdAndUserId,
  findBudgetByBudgetId,
} = require("../repositories/budget.repository");

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
};
