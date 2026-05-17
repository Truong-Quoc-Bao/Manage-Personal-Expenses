const {
  findBudgets,
  findBudgetByBudgetId,
  createBudgetId,
  findDateByCategory,
  updateBudget,
  deleteBudget,
  deriveStatusFromType,
} = require("../repositories/budget.repository");
const { validateCategory } = require("../gRPC/category.client");
const rabbitMQClient = require("../../../shared/rabbitmq-client");

const VALID_BUDGET_TYPES = ["limit", "plan"];

const BUDGET_TYPE_TO_CATEGORY_TYPE = {
  limit: "Expense",
  plan: "Income",
};

const toIsoOrNull = (value) => {
  if (!value) return null;
  const d = value instanceof Date ? value : new Date(value);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
};

const buildBudgetEventPayload = (budget) => {
  if (!budget) return null;
  return {
    budget_id: budget.budget_id,
    user_id: budget.user_id,
    category_id: budget.category_id,
    title: budget.title,
    type: budget.type,
    amount_limit: budget.amount_limit != null ? Number(budget.amount_limit) : 0,
    current_amount: budget.current_amount != null ? Number(budget.current_amount) : 0,
    date_start: toIsoOrNull(budget.date_start),
    date_end: toIsoOrNull(budget.date_end),
    // `status` không lưu xuống DB (enum DB chưa migrate), nên derive lại từ type.
    status: budget.status ?? deriveStatusFromType(budget.type),
    status_active: budget.status_active,
  };
};

const safePublish = async (routingKey, payload) => {
  try {
    await rabbitMQClient.publish(routingKey, payload);
  } catch (err) {
    console.error(`[Budget] Failed to publish ${routingKey}:`, err.message);
  }
};

async function validateCategoryForBudgetType({ categoryId, userId, type }) {
  const expectedCategoryType = BUDGET_TYPE_TO_CATEGORY_TYPE[type];
  if (!expectedCategoryType) {
    const error = new Error(`Invalid budget type: ${type}. Must be one of: ${VALID_BUDGET_TYPES.join(", ")}`);
    error.statusCode = 400;
    throw error;
  }

  try {
    const result = await validateCategory({
      categoryId,
      userId,
      transactionType: expectedCategoryType,
    });

    if (!result.valid) {
      const error = new Error(
        `Category does not match budget type. Budget type "${type}" requires a "${expectedCategoryType}" category.`
      );
      error.statusCode = 400;
      throw error;
    }
  } catch (err) {
    if (err.statusCode) throw err;
    console.error("[Budget] Category validation via gRPC failed:", err.message);
    const error = new Error("Unable to validate category. Category service unavailable.");
    error.statusCode = 503;
    throw error;
  }
}

const deleteBudgetService = async ({ userId, budgetId }) => {
  console.log('🔍 [budget_delete qua API] userId service:', userId);
  console.log('🔍 [budget_delete qua API] budgetId service:', budgetId);
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

  await safePublish("budget.deleted", buildBudgetEventPayload(checkBudget));

  return budgets;
};

const updateBudgetService = async ({
  userId,
  budgetId,
  title,
  categoryId,
  type,
  amountLimit,
  dateStart,
  dateEnd,
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
    const error = new Error("amountLimit is required update");
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

  const budgetType = type || checkBudget.type || "limit";

  if (!VALID_BUDGET_TYPES.includes(budgetType)) {
    const error = new Error(`Invalid budget type: ${budgetType}. Must be one of: ${VALID_BUDGET_TYPES.join(", ")}`);
    error.statusCode = 400;
    throw error;
  }

  await validateCategoryForBudgetType({ categoryId, userId, type: budgetType });

  if (amountLimit <= 0) {
    const error = new Error("AmountLimit can not be less than 0");
    error.statusCode = 400;
    throw error;
  }

  const budgets = await updateBudget({
    userId,
    budgetId,
    title,
    categoryId,
    type: budgetType,
    amountLimit,
    dateStart,
    dateEnd,
  });

  await safePublish("budget.updated", {
    ...buildBudgetEventPayload(budgets),
    old_category_id: checkBudget.category_id,
    old_type: checkBudget.type,
    old_amount_limit:
      checkBudget.amount_limit != null ? Number(checkBudget.amount_limit) : 0,
    old_date_start: toIsoOrNull(checkBudget.date_start),
    old_date_end: toIsoOrNull(checkBudget.date_end),
  });

  return budgets;
};

const createBudgetService = async ({
  title,
  userId,
  categoryId,
  type,
  amountLimit,
  dateStart,
  dateEnd,
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
    const error = new Error("amountLimit is required create");
    error.statusCode = 400;
    throw error;
  }

  if (!dateStart) {
    const error = new Error("date start is required");
    error.statusCode = 400;
    throw error;
  }

  const budgetType = type || "limit";

  if (!VALID_BUDGET_TYPES.includes(budgetType)) {
    const error = new Error(`Invalid budget type: ${budgetType}. Must be one of: ${VALID_BUDGET_TYPES.join(", ")}`);
    error.statusCode = 400;
    throw error;
  }

  await validateCategoryForBudgetType({ categoryId, userId, type: budgetType });

  const checkDate = await findDateByCategory({
    userId,
    categoryId,
    dateStart,
  });

  if (checkDate) {
    const error = new Error("this Budget is set today");
    error.statusCode = 400;
    throw error;
  }

  const budget = await createBudgetId({
    title,
    userId,
    categoryId,
    type: budgetType,
    amountLimit,
    dateStart,
    dateEnd,
  });

  await safePublish("budget.created", buildBudgetEventPayload(budget));

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
