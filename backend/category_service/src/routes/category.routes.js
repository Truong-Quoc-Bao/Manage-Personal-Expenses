const express = require("express");
const { getCategoryList } = require("../controllers/category.controller");
const { validateGetCategories } = require("../validator/category.validator");
// const authMiddleware = require("../middlewares/auth.middleware");

const router = express.Router();

// GET /api/categories?type=income
router.get(
  "/categories",
//   validateGetCategories,
  getCategoryList
);

module.exports = router;