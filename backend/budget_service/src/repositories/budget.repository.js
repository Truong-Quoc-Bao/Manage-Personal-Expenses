const prisma = require("../config/database");

const buildDateFilter = (date) => {
  const cleanDate = date.trim();

  // YYYY
  if (/^\d{4}$/.test(cleanDate)) {
    const year = Number(cleanDate);
    return {
      gte: new Date(year, 0, 1),
      lt: new Date(year + 1, 0, 1),
    };
  }

  // YYYY-MM
  if (/^\d{4}-\d{2}$/.test(cleanDate)) {
    const [year, month] = cleanDate.split("-").map(Number);
    return {
      gte: new Date(year, month - 1, 1),
      lt: new Date(year, month, 1),
    };
  }

  // YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(cleanDate)) {
    const [year, month, day] = cleanDate.split("-").map(Number);
    return {
      gte: new Date(year, month - 1, day),
      lt: new Date(year, month - 1, day + 1),
    };
  }

  return null;
};

// status_active reflects whether the budget is currently in its effective window.
// - false when "now" is still before date_start (chưa tới ngày bắt đầu)
// - false when date_end exists and "now" is past it (đã kết thúc)
// - true otherwise (đang áp dụng) — including the case where date_end is null
const computeStatusActive = (dateStart, dateEnd, now = new Date()) => {
  if (!dateStart) return false;
  const start = dateStart instanceof Date ? dateStart : new Date(dateStart);
  if (Number.isNaN(start.getTime())) return false;
  if (now < start) return false;

  if (dateEnd) {
    const end = dateEnd instanceof Date ? dateEnd : new Date(dateEnd);
    if (!Number.isNaN(end.getTime()) && now > end) return false;
  }
  return true;
};

// status mirrors the budget "loại":
//   type === "plan"  → status = "goal"  (mục tiêu thu nhập / tiết kiệm)
//   type === "limit" → status = "limit" (hạn mức chi tiêu)
const deriveStatusFromType = (type) => (type === "plan" ? "goal" : "limit");

// Recompute status_active for an already-loaded budget row.
const enrichBudget = (budget) => {
  if (!budget) return budget;
  return {
    ...budget,
    status_active: computeStatusActive(budget.date_start, budget.date_end),
  };
};

const BUDGET_SELECT = {
  budget_id: true,
  user_id: true,
  title: true,
  category_id: true,
  type: true,
  amount_limit: true,
  current_amount: true,
  date: true,
  date_start: true,
  date_end: true,
  status: true,
  status_active: true,
  note: true,
  created_at: true,
  updated_at: true,
};

const deleteBudget = async ({ budgetId }) => {
  return prisma.budget.delete({
    where: {
      budget_id: budgetId,
    },
  });
};

const updateBudget = async ({
  budgetId,
  title,
  categoryId,
  type,
  amountLimit,
  dateStart,
  dateEnd,
}) => {
  const startDate = new Date(dateStart);

  // When the caller doesn't supply dateEnd, default to the end of the start month
  // (preserves existing behaviour for monthly budgets).
  const endDate = dateEnd
    ? new Date(dateEnd)
    : new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0);

  const statusActive = computeStatusActive(startDate, endDate);

  // NOTE: cột `status` (Postgres enum "Status") trong DB hiện chưa có giá trị "limit"
  // (schema.prisma có nhưng migration chưa apply). Bỏ qua field này khi ghi để tránh
  // lỗi 22P02 "invalid input value for enum Status". Giá trị status sẽ được derive
  // ở tầng service (buildBudgetEventPayload) khi cần phát event.
  const updated = await prisma.budget.update({
    where: {
      budget_id: budgetId,
    },
    data: {
      title,
      category_id: categoryId,
      type,
      amount_limit: amountLimit,
      date_start: startDate,
      date_end: endDate,
      status_active: statusActive,
      updated_at: new Date(),
    },
    select: BUDGET_SELECT,
  });

  return enrichBudget(updated);
};

const findDateByCategory = async ({ userId, categoryId, dateStart }) => {
  return prisma.budget.findFirst({
    where: {
      user_id: userId,
      category_id: categoryId,
      date_start: dateStart,
    },
  });
};

const findBudgetByBudgetId = async ({ userId, budgetId }) => {
  const budget = await prisma.budget.findFirst({
    where: {
      user_id: userId,
      budget_id: budgetId,
    },
  });
  return enrichBudget(budget);
};

const createBudgetId = async ({
  title,
  userId,
  categoryId,
  type,
  amountLimit,
  dateStart,
  dateEnd,
}) => {
  const startDate = new Date(dateStart);

  const endDate = dateEnd
    ? new Date(dateEnd)
    : new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0);

  const resolvedType = type || "limit";
  const statusActive = computeStatusActive(startDate, endDate);

  // NOTE: tạm thời không ghi field `status` (xem ghi chú ở updateBudget).
  const created = await prisma.budget.create({
    data: {
      title: title,
      user_id: userId,
      category_id: categoryId,
      type: resolvedType,
      amount_limit: amountLimit,
      date: new Date(),
      date_start: startDate,
      date_end: endDate,
      status_active: statusActive,
    },
    select: BUDGET_SELECT,
  });

  return enrichBudget(created);
};

const findBudgets = async ({ userId, categoryId, dateStart }) => {
  const where = {
    user_id: userId,
    ...(categoryId ? { category_id: categoryId } : {}),
  };

  if (dateStart) {
    const dateFilter = buildDateFilter(dateStart);
    if (dateFilter) {
      where.date_start = dateFilter;
    }
  }

  const budgets = await prisma.budget.findMany({ where });
  return budgets.map(enrichBudget);
};

const findBudgetsByUserAndCategory = async ({ userId, categoryId, date }) => {
  const transactionDate = new Date(date);

  const budgets = await prisma.budget.findMany({
    where: {
      user_id: userId,
      category_id: categoryId,
      date_start: { lte: transactionDate },
      date_end: { gte: transactionDate },
    },
  });
  return budgets.map(enrichBudget);
};

const updateBudgetCurrentAmount = async ({ budgetId, currentAmount }) => {
  return prisma.budget.update({
    where: { budget_id: budgetId },
    data: {
      current_amount: currentAmount,
      updated_at: new Date(),
    },
  });
};

module.exports = {
  findBudgets,
  findBudgetByBudgetId,
  createBudgetId,
  findDateByCategory,
  updateBudget,
  deleteBudget,
  findBudgetsByUserAndCategory,
  updateBudgetCurrentAmount,
  computeStatusActive,
  deriveStatusFromType,
};
