const { getCategories } = require("../services/category.service");
const { creaCategories } = require("../services/category.service");
const { updCategories } = require("../services/category.service");
const { delCategoryService } = require("../services/category.service");



const getCategoryList = async (req, res, next) => {
  try {
    // const type = req.query;
    const userId = "e67f2863-5f03-4dff-b247-478b140ab6c4";

    const categories = await getCategories({ userId });

    console.log("QUERY:", req.query); 
    return res.status(200).json({
      success: true,
      message: "Get categories successfully",
      data: categories,
    });

    
  } catch (error) {
    next(error);
  }
};

const createCategory = async (req, res, next) => {
  try {
    // const type = req.query;
    const userId = "e67f2863-5f03-4dff-b247-478b140ab6c4";
    const category = req.body;
    console.log("Creating controller category with data:", { userId, cat: category }); // Debug log to check input data

    const categories = await creaCategories({ userId, cat: category });

    // console.log("QUERY:", req.query); 
    return res.status(200).json({
      success: true,
      message: "POST categories successfully",
      data: categories,
    });

    
  } catch (error) {
    next(error);
  }
};

const updateCategory = async (req, res, next) => {
  try {
    const userId = "e67f2863-5f03-4dff-b247-478b140ab6c4";
    const category = req.body;
    const catid = req.params.id;
    const categories = await updCategories({ userId, catid ,cat: category });

    return res.status(200).json({
      success: true,
      message: "PUT categories successfully",
      data: categories,
    });
  } catch (error) {
    next(error);
  }
};

const deleteCategory = async (req, res, next) => {
  try {
    const userId = "e67f2863-5f03-4dff-b247-478b140ab6c4";
    // const category = req.body;
    const catid = req.params.id;
    const categories = await delCategoryService({ categoryId: catid });

    return res.status(200).json({
      success: true,
      message: "DELETE categories successfully",
      data: categories,
    });
  } catch (error) {
    next(error);
  }
};


module.exports = {
  getCategoryList,createCategory,updateCategory,deleteCategory
};