const { getCategories } = require("../services/category.service");
const { creaCategories } = require("../services/category.service");
const { updCategories } = require("../services/category.service");
const { delCategoryService } = require("../services/category.service");

function requireUserId(req, res) {
  const userId = req.headers['x-user-id'];
  if (userId == null || userId === "") {
    res.status(401).json({ success: false, message: "Unauthorized" });
    return null;
  }
  return String(userId);
}

const getCategoryList = async (req, res, next) => {
  try {
    const userId = requireUserId(req, res);
    if (!userId) return;

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
    const userId = requireUserId(req, res);
    if (!userId) return;
    const category = req.body;
    console.log("Creating controller category with data:", {
      userId,
      cat: category,
    });

    const categories = await creaCategories({ userId, cat: category });

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
    const userId = requireUserId(req, res);
    if (!userId) return;
    const category = req.body;
    const catid = req.params.id;
    const categories = await updCategories({ userId, catid, cat: category });

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
    const userId = requireUserId(req, res);
    if (!userId) return;
    const catid = req.params.id;
    const categories = await delCategoryService({ categoryId: catid, userId });

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
  getCategoryList,
  createCategory,
  updateCategory,
  deleteCategory,
};
