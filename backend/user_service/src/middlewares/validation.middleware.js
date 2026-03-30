const validate = (schema) => {
  return (req, res, next) => {
    const errors = [];

    for (const key of ["body", "query", "params"]) {
      if (schema[key]) {
        const { error } = schema[key].validate(req[key], {
          abortEarly: false,
          allowUnknown: false,
        });

        if (error) {
          errors.push(
            ...error.details.map((item) => ({
              field: item.path.join("."),
              message: item.message,
            }))
          );
        }
      }
    }

    if (errors.length) {
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors,
      });
    }

    next();
  };
};

module.exports = validate;
