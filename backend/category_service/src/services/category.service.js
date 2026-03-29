const { findCategories } = require("../repositories/category.repository");
const { createCategories } = require("../repositories/category.repository");


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


  const categories = await createCategories({ userId ,cat});

  return categories;
};



module.exports = {
  getCategories,creaCategories
};