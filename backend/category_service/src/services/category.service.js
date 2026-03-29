const { findCategories } = require("../repositories/category.repository");

const getCategories = async ({ userId, type }) => {
  // validate type
  if (!type) {
    const error = new Error("type is required");
    error.statusCode = 400;
    throw error;
  }

  if (!["income", "expense"].includes(type)) {
    const error = new Error("type must be income or expense");
    error.statusCode = 400;
    throw error;
  }

  const categories = await findCategories({ userId, type });

  return categories;
};

module.exports = {
  getCategories,
};