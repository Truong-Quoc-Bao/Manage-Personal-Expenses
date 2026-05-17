const prisma = require('../config/database');

const findCategories = async ({ userId }) => {
  return prisma.category.findMany({
    where: {
      user_id: userId,
    },
    orderBy: {
      created_at: 'desc',
    },
  });
};

const findOneCategory = async (category_id) => {
  return prisma.category.findUnique({
    where: {
      category_id: category_id,
    },
  });
};

const findOneCategoryForTransactionCheck = async (category_id, user_id, type) => {
  return prisma.category.findFirst({
    where: {
      category_id: category_id,
      user_id: user_id,
      type: type,
    },
  });
};

const findCategoryForDisplay = async (category_id, user_id, type) => {
  return prisma.category.findFirst({
    where: {
      category_id: category_id,
      user_id: user_id,
      type: type,
    },
  });
};

const createCategories = async ({ userId, cat }) => {
  console.log('Creating repo category with data:', { userId, cat }); // Debug log to check input data
  return prisma.category.create({
    data: {
      // category_id: crypto.randomUUID(),
      user_id: userId,
      icon_id: cat.icon_id,
      category_name: cat.category_name,
      type: cat.type,
      color: cat.color,
      is_system: false,
      created_at: new Date(),
    },
  });
};

const updateCategory = async ({ userId, category_id, cat }) => {
  return prisma.category.update({
    where: {
      category_id: category_id,
    },
    data: {
      category_id: category_id,
      user_id: userId,
      icon_id: cat.icon_id,
      category_name: cat.category_name,
      type: cat.type,
      color: cat.color,
      is_system: cat.is_system,
      created_at: cat.created_at,
    },

    // orderBy: {
    //   created_at: "desc",
    // },
  });
};

const deleteCategory = async (categoryId) => {
  return prisma.category.delete({
    where: {
      category_id: categoryId,
    },
  });
};
module.exports = {
  findCategories,
  createCategories,
  updateCategory,
  findOneCategory,
  deleteCategory,
  findOneCategoryForTransactionCheck,
  findCategoryForDisplay,
};
