const express = require("express");
const { getCategoryList, createCategory, updateCategory, deleteCategory } = require("../controllers/category.controller");



const { validateGetCategories } = require("../validator/category.validator");
// const authMiddleware = require("../middlewares/auth.middleware");

const router = express.Router();

// GET /api/categories?type=income
router.get("/categories",getCategoryList);

router.post("/category",createCategory);

router.put("/category/:id",updateCategory);

router.delete("/category/:id",deleteCategory);



module.exports = router;