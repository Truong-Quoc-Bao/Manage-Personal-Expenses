const Joi = require("joi");

const bannedWords = [
  "dit",
  "dm",
  "clm",
  "vcl",
  "cc",
  "lon",
  "cac",
  "cho",
  "địt",
  "dm",
  "clm",
  "vcl",
  "cc",
  "lồn",
  "cặc",
  "chó",
  "đụ má",
  "đụ mẹ",
];

const updateProfile = {
  body: Joi.object({
    userName: Joi.string()
      .max(100)
      .custom((value, helpers) => {
        const normalized = value.toLowerCase().trim();

        const hasBannedWord = bannedWords.some((word) =>
          normalized.includes(word)
        );

        if (hasBannedWord) {
          return helpers.error("any.invalid");
        }

        return value;
      })
      .optional()
      .messages({
        "string.max": "user_name must not exceed 100 characters",
        "any.invalid": "user_name contains inappropriate content",
      }),

    birth: Joi.string()
      .pattern(/^\d{4}-\d{2}-\d{2}$/)
      .optional()
      .messages({
        "string.pattern.base": "birth must be in YYYY-MM-DD format",
      }),
  }).min(1),
};

module.exports = {
  updateProfile,
};
