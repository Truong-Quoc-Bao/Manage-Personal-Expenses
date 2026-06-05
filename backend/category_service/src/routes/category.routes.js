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

const express = require('express');

const {
  getCategoryList,
  createCategory,
  updateCategory,
  deleteCategory,
} = require('../controllers/category.controller');
const categoryService = require('../services/category.service');

const validate = require('../middlewares/validation.middleware');

const {
  getCategoriesSchema,
  createCategorySchema,
  updateCategorySchema,
  deleteCategorySchema,
} = require('../validator/category.validator');

const router = express.Router();

// GET
router.get('/categories', validate(getCategoriesSchema), getCategoryList);

// POST
router.post('/category', validate(createCategorySchema), createCategory);

// PUT
router.put('/category/:id', validate(updateCategorySchema), updateCategory);

// DELETE
router.delete('/category/:id', validate(deleteCategorySchema), deleteCategory);

// Internal endpoints for transaction-service
router.get('/internal/:categoryId/status', async (req, res) => {
  try {
    const { categoryId } = req.params;
    const { userId, transactionType } = req.query;
    const isValid = await categoryService.checkValidCategory({
      categoryId,
      userId,
      transactionType,
    });
    res.json({ valid: isValid, message: isValid ? 'Category valid' : 'Category not found' });
  } catch (error) {
    res.status(500).json({ valid: false, message: error.message });
  }
});

router.get('/internal/:categoryId/display', async (req, res) => {
  try {
    const { categoryId } = req.params;
    const { userId, transactionType } = req.query;
    const display = await categoryService.getCategoryForDisplay({
      categoryId,
      userId,
      transactionType,
    });
    res.json(display);
  } catch (error) {
    res.status(500).json({ found: false, category_name: '', color: '', icon_code: '' });
  }
});

module.exports = router;
