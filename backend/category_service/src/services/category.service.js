const { findCategories } = require("../repositories/category.repository");
const { createCategories } = require("../repositories/category.repository");
const { updateCategory } = require("../repositories/category.repository");
const { findOneCategory } = require("../repositories/category.repository");
const { deleteCategory } = require("../repositories/category.repository");
const categoryRepository = require("../repositories/category.repository");





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

  console.log("Creating service category with data:", { userId, cat }); // Debug log to check input data

  const categories = await createCategories({ userId ,cat});

  return categories;
};

const updCategories = async ({ userId , catid, cat}) => {

  const existing = await findOneCategory(catid);
  console.log("Existing category:", existing); // Debug log to check the existing category

  const check_issystem = existing ? existing.is_system : false; // Handle case where category is not found
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

  return categories;
};

const delCategoryService = async ({ categoryId }) => {
  const category = await findOneCategory(categoryId);

  if (!category) {
    const error = new Error("Category not found");
    error.statusCode = 404;
    throw error;
  }

  const categories = await deleteCategory(categoryId);
  return categories;
};

const checkValidCategory = async ({ categoryId, userId, transactionType }) => {
  const isValid = await categoryRepository.findOneCategoryForTransactionCheck(categoryId, userId, transactionType.toLowerCase());

  return isValid === null ? false : true;
};


module.exports = {
  getCategories,
  creaCategories,
  updCategories,
  delCategoryService,
  checkValidCategory
};