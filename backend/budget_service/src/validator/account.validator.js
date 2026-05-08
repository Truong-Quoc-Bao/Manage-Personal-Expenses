const Joi = require("joi");

const budgetValidation = {
  query: Joi.object({
    title: Joi.string().trim().min(2).max(100).optional().messages({
      "string.base": "title must be a string",
      "string.empty": "title is not allowed to be empty",
      "string.min": "title must be at least 2 characters",
      "string.max": "title must not exceed 100 characters",
    }),

    userId: Joi.string().trim().optional().messages({
      "string.base": "userId must be a string",
    }),

    categoryId: Joi.string().trim().optional().messages({
      "string.base": "categoryId must be a string",
    }),

    amountLimit: Joi.number().positive().optional().messages({
      "number.base": "amountLimit must be a number",
      "number.positive": "amountLimit must be greater than 0",
    }),

    dateStart: Joi.string()
      .trim()
      .pattern(/^\d{4}(-\d{2})?(-\d{2})?$/)
      .optional()
      .messages({
        "string.base": "date must be a string",
        "string.pattern.base":
          "date must be in YYYY or YYYY-MM or YYYY-MM-DD format",
      }),
  }),
};

module.exports = {
  budgetValidation,
};
