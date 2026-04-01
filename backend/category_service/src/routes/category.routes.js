// const express = require("express");
// const { getCategoryList, createCategory, updateCategory, deleteCategory } = require("../controllers/category.controller");



// const { validateGetCategories } = require("../validator/category.validator");
// // const authMiddleware = require("../middlewares/auth.middleware");

// const router = express.Router();

// // GET /api/categories?type=income
// router.get("/categories",getCategoryList);

// router.post("/category",createCategory);

// router.put("/category/:id",updateCategory);

// router.delete("/category/:id",deleteCategory);



// module.exports = router;


const express = require("express");

const {
  getCategoryList,
  createCategory,
  updateCategory,
  deleteCategory,
} = require("../controllers/category.controller");

const validate = require("../middlewares/validation.middleware");

const {
  getCategoriesSchema,
  createCategorySchema,
  updateCategorySchema,
  deleteCategorySchema,
} = require("../validator/category.validator");

const router = express.Router();

// GET
router.get(
  "/categories",
  validate(getCategoriesSchema),
  getCategoryList
);

// POST
router.post(
  "/category",
  validate(createCategorySchema),
  createCategory
);

// PUT
router.put(
  "/category/:id",
  validate(updateCategorySchema),
  updateCategory
);

// DELETE
router.delete(
  "/category/:id",
  validate(deleteCategorySchema),
  deleteCategory
);

module.exports = router;