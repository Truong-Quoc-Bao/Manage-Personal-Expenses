const { getCategories } = require("../services/category.service");

const getCategoryList = async (req, res, next) => {
  try {
    const type = req.query.type;
    const userId = "e67f2863-5f03-4dff-b247-478b140ab6c4";

    const categories = await getCategories({ userId, type });

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

module.exports = {
  getCategoryList,
};