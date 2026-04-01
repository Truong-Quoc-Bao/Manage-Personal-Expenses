const validateGetCategories = (req, res, next) => {
  const { type } = req.query;

  if (!type) {
    return res.status(400).json({
      success: false,
      message: "type is required",
    });
  }

  if (!["income", "expense"].includes(type)) {
    return res.status(400).json({
      success: false,
      message: "type must be income or expense",
    });
  }

  next();
};
const Joi = require("joi");

// GET
const getCategoriesSchema = Joi.object({
  query: Joi.object({
    type: Joi.string().valid("income", "expense").optional(),
  }),
});

// POST
const createCategorySchema = Joi.object({
  body: Joi.object({
    category_name: Joi.string().trim().min(1).required(),
    type: Joi.string().valid("income", "expense").required(),
    icon_id: Joi.string().uuid().required(),
    color: Joi.string().optional(),
  }),
});

// PUT
const updateCategorySchema = Joi.object({
  params: Joi.object({
    id: Joi.string().uuid().required(),
  }),
  body: Joi.object({
    category_name: Joi.string().trim().min(1),
    type: Joi.string().valid("income", "expense"),
    icon_id: Joi.string().uuid(),
    color: Joi.string(),
  }).min(1),
});

// DELETE
const deleteCategorySchema = Joi.object({
  params: Joi.object({
    id: Joi.string().uuid().required(),
  }),
});

module.exports = {
  getCategoriesSchema,
  createCategorySchema,
  updateCategorySchema,
  deleteCategorySchema,
};