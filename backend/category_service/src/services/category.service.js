const { findCategories } = require("../repositories/category.repository");
const { createCategories } = require("../repositories/category.repository");
const { updateCategory } = require("../repositories/category.repository");
const { findOneCategory } = require("../repositories/category.repository");
const { deleteCategory } = require("../repositories/category.repository");
const categoryRepository = require("../repositories/category.repository");
const rabbitMQClient = require("../../../shared/rabbitmq-client");





const getCategories = async ({ userId}) => {
  // validate type
  // if (!type) {
  //   const error = new Error("type is required");
  //   error.statusCode = 400;
  //   throw error;
  // }

  // if (!["income", "expense"].includes(type)) {
  //   const error = new Error("type must be income or expense");
  //   error.statusCode = 400;
  //   throw error;
  // }

  const categories = await findCategories({ userId });

  return categories;
};

const creaCategories = async ({ userId , cat}) => {

  console.log("Creating service category with data:", { userId, cat });

  const categories = await createCategories({ userId ,cat});

  try {
    await rabbitMQClient.publish("category.created", {
      category_id: categories.category_id,
      user_id: userId,
      category_name: categories.category_name,
      type: categories.type,
      color: categories.color,
    });
  } catch (err) {
    console.error("[Category] Failed to publish category.created:", err.message);
  }

  return categories;
};

const updCategories = async ({ userId , catid, cat}) => {

  const existing = await findOneCategory(catid);
  console.log("Existing category:", existing);

  const check_issystem = existing ? existing.is_system : false;
  if (!existing) {
    const error = new Error("Category not found");
    error.statusCode = 404;
    throw error;
  }
  cat.is_system = existing.is_system;

  if (check_issystem) {
    const error = new Error("Cannot update system category");
    error.statusCode = 403;
    throw error;
  }
  const categories = await updateCategory({ userId , category_id: catid, cat });

  try {
    await rabbitMQClient.publish("category.updated", {
      category_id: catid,
      user_id: userId,
      category_name: categories.category_name,
      type: categories.type,
      color: categories.color,
      old_category_name: existing.category_name,
      old_type: existing.type,
    });
  } catch (err) {
    console.error("[Category] Failed to publish category.updated:", err.message);
  }

  return categories;
};

const delCategoryService = async ({ categoryId, userId }) => {
  const category = await findOneCategory(categoryId);

  if (!category) {
    const error = new Error("Category not found");
    error.statusCode = 404;
    throw error;
  }

  const categories = await deleteCategory(categoryId);

  try {
    await rabbitMQClient.publish("category.deleted", {
      category_id: categoryId,
      user_id: userId || category.user_id,
      category_name: category.category_name,
      type: category.type,
    });
  } catch (err) {
    console.error("[Category] Failed to publish category.deleted:", err.message);
  }

  return categories;
};

const checkValidCategory = async ({ categoryId, userId, transactionType }) => {
  const isValid = await categoryRepository.findOneCategoryForTransactionCheck(categoryId, userId, transactionType.toLowerCase());

  return isValid === null ? false : true;
};

const getCategoryForDisplay = async ({ categoryId, userId, transactionType }) => {
  const cat = await categoryRepository.findCategoryForDisplay(
    categoryId,
    userId,
    transactionType.toLowerCase()
  );
  if (!cat) {
    return { found: false, category_name: '', color: '', icon_code: '' };
  }
  return {
    found: true,
    category_name: cat.category_name,
    color: cat.color || '',
    icon_code: cat.icon?.icon_code || '',
  };
};

module.exports = {
  getCategories,
  creaCategories,
  updCategories,
  delCategoryService,
  checkValidCategory,
  getCategoryForDisplay,
};