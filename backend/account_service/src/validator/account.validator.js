const Joi = require('joi');

const accountValidation = {
  body: Joi.object({
    accountName: Joi.string()
      .trim()
      .max(100)
      .messages({
        'string.base': 'accountName must be a string',
        'string.empty': 'accountName is required',
        'string.max': 'accountName must not exceed 100 characters',
        'any.required': 'accountName is required',
      })
      .optional(),

    type: Joi.string()
      .valid('cash', 'credit', 'bank', 'ewallet')
      .messages({
        'string.base': 'type must be a string',
        'any.only': 'type must be one of: cash, credit, bank, ewallet',
        'string.empty': 'type is required',
        'any.required': 'type is required',
      })
      .optional(),

    balance: Joi.number()
      // .greater(0)
      .min(0)
      .default(0)
      .messages({
        'number.base': 'balance must be a number',
        // 'number.greater': 'balance must be greater than 0',
        'number.min': 'balance must be at least 0',
        'any.required': 'balance is required',
      })
      .optional()
      .allow(0),

    currency: Joi.string()
      .valid('VND', 'USD')
      .messages({
        'string.base': 'currency must be a string',
        'any.only': 'currency must be one of: VND, USD',
        'string.empty': 'currency is required',
        'any.required': 'currency is required',
      })
      .optional(),
  }),
};

module.exports = {
  accountValidation,
};
