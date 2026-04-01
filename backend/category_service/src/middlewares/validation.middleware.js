const { request } = require("express");

const validate = (schema) => (req, res, next) => {
  console.log(req.body); // Debug log to check the schema being used
  const dataToValidate = {
    body: req.body,
    params: req.params,
    query: req.query,
  };

  const { value, error } = schema.validate(dataToValidate, {
    abortEarly: false,
    allowUnknown: true,
  });
  console.log("Validation result:", { value, error }); // Debug log to check validation result
  if (error) {
    const errors = error.details.map((err) => ({
      field: err.path.join("."),
      message: err.message,
    }));

    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors,
    });
  }
 console.log("Validation passed for data:", dataToValidate); // Debug log to check validated data
  next();
};

module.exports = validate;