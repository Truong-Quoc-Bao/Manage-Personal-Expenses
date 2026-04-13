const { date } = require("joi");
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

const deleteBudget = async ({ budgetId }) => {
  return prisma.budget.delete({
    where: {
      budget_id: budgetId,
    },
  });
};
const updateBudget = async ({ budgetId, categoryId, amountLimit, date }) => {
  return prisma.budget.update({
    where: {
      budget_id: budgetId,
    },
    data: {
      category_id: categoryId,
      amount_limit: amountLimit,
      date: date,
    },
    select: {
      category_id: true,
      amount_limit: true,
      date: true,
    },
  });
};
const findDateByCategory = async ({ userId, categoryId, date }) => {
  return prisma.budget.findFirst({
    where: {
      user_id: userId,
      category_id: categoryId,
      date: date,
    },
  });
};

const findBudgetByBudgetId = async ({ userId, budgetId }) => {
  return prisma.budget.findFirst({
    where: {
      user_id: userId,
      budget_id: budgetId,
    },
  });
};
const createBudgetId = async ({ userId, categoryId, amountLimit, date }) => {
  return prisma.budget.create({
    data: {
      user_id: userId,
      category_id: categoryId,
      amount_limit: amountLimit,
      date: date,
    },
    select: {
      budget_id: true,
      amount_limit: true,
      date: true,
    },
  });
};
const findBudgets = async ({ userId, categoryId, date }) => {
  const where = {
    user_id: userId,
    ...(categoryId ? { category_id: categoryId } : {}),
  };

  if (date) {
    const dateFilter = buildDateFilter(date);
    if (dateFilter) {
      where.date = dateFilter;
    }
  }

  return prisma.budget.findMany({
    where,
  });
};

// MQ budget -> category

const findCategoryByIdAndUserId = async ({ categoryId, userId }) => {
  return prisma.budget.findFirst({
    where: {
      category_id: categoryId,
      user_id: userId,
    },
  });
};

module.exports = {
  findBudgets,
  findCategoryByIdAndUserId,
  findBudgetByBudgetId,
  createBudgetId,
  findDateByCategory,
  updateBudget,
  deleteBudget,
};
