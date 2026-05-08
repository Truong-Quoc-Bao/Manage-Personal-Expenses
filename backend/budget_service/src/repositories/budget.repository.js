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
const updateBudget = async ({
  budgetId,
  title,
  categoryId,
  amountLimit,
  dateStart,
}) => {
  const startDate = new Date(dateStart);

  const dateEnd = new Date(
    startDate.getFullYear(),
    startDate.getMonth() + 1,
    0
  );

  return prisma.budget.update({
    where: {
      budget_id: budgetId,
    },
    data: {
      title,
      category_id: categoryId,
      amount_limit: amountLimit,
      date_start: startDate,
      date_end: dateEnd,
    },
    select: {
      title: true,
      budget_id: true,
      category_id: true,
      amount_limit: true,
      date_start: true,
      date_end: true,
    },
  });
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
  return prisma.budget.findFirst({
    where: {
      user_id: userId,
      budget_id: budgetId,
    },
  });
};
const createBudgetId = async ({
  title,
  userId,
  categoryId,
  amountLimit,
  dateStart,
}) => {
  const startDate = new Date(dateStart);

  const dateEnd = new Date(
    startDate.getFullYear(),
    startDate.getMonth() + 1,
    0
  );

  return prisma.budget.create({
    data: {
      title: title,
      user_id: userId,
      category_id: categoryId,
      amount_limit: amountLimit,
      date: new Date(),
      date_start: startDate,
      date_end: dateEnd,
    },
    select: {
      title: true,
      budget_id: true,
      category_id: true,
      amount_limit: true,
      date_start: true,
      date_end: true,
    },
  });
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

  return prisma.budget.findMany({
    where,
  });
};

// MQ budget -> category

module.exports = {
  findBudgets,
  findBudgetByBudgetId,
  createBudgetId,
  findDateByCategory,
  updateBudget,
  deleteBudget,
};
