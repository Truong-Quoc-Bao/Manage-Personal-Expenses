const { budget } = require("../config/database");
const {
  findBudgets,
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
  title,
  categoryId,
  amountLimit,
  dateStart,
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

  if (!dateStart) {
    const error = new Error("date_start is required");
    error.statusCode = 400;
    throw error;
  }

  const checkBudget = await findBudgetByBudgetId({ userId, budgetId });

  if (!checkBudget) {
    const error = new Error("Budget_id is not found");
    error.statusCode = 400;
    throw error;
  }

  // Bỏ check category vì category thuộc category_service.
  // Frontend đã gọi category API để lấy category_id hợp lệ.
  // Nếu cần validate category thật sự, nên gọi category_service qua API/gRPC,
  // không nên check bằng bảng budget.
  /*
  const checkCategory = await findCategoryByIdAndUserId({ categoryId, userId });

  if (!checkCategory) {
    const error = new Error("Category does not exist");
    error.statusCode = 404;
    throw error;
  }
  */

  if (amountLimit <= 0) {
    const error = new Error("AmountLimit can not be less than 0");
    error.statusCode = 404;
    throw error;
  }

  const budgets = await updateBudget({
    userId,
    budgetId,
    title,
    categoryId,
    amountLimit,
    dateStart,
  });

  return budgets;
};

const createBudgetService = async ({
  title,
  userId,
  categoryId,
  amountLimit,
  dateStart,
}) => {
  if (!userId) {
    const error = new Error("userId is required");
    error.statusCode = 400;
    throw error;
  }

  if (!title) {
    const error = new Error("title is required");
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

  if (!dateStart) {
    const error = new Error("date start is required");
    error.statusCode = 400;
    throw error;
  }

  // Bỏ check category vì category thuộc category_service.
  /*
  const category = await findCategoryByIdAndUserId({ categoryId, userId });

  if (!category) {
    const error = new Error("Category does not exist");
    error.statusCode = 404;
    throw error;
  }
  */

  const checkDate = await findDateByCategory({
    userId,
    categoryId,
    dateStart,
  });

  if (checkDate) {
    const error = new Error("this Budget is set today");
    error.statusCode = 404;
    throw error;
  }

  const budget = await createBudgetId({
    title,
    userId,
    categoryId,
    amountLimit,
    dateStart,
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

const getBudgetByUserIdService = async ({ userId, categoryId, dateStart }) => {
  if (!userId) {
    const error = new Error("userId is required");
    error.statusCode = 400;
    throw error;
  }

  // Bỏ check category vì category thuộc category_service.
  /*
  if (categoryId) {
    const category = await findCategoryByIdAndUserId({ categoryId, userId });

    if (!category) {
      const error = new Error("Category does not exist");
      error.statusCode = 404;
      throw error;
    }
  }
  */

  const budgets = await findBudgets({ userId, categoryId, dateStart });

  return budgets;
};
module.exports = {
  getBudgetByUserIdService,
  getBudgetByBudgetIdService,
  createBudgetService,
  updateBudgetService,
  deleteBudgetService,
};
