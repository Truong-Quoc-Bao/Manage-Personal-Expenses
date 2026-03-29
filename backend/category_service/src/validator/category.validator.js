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

module.exports = {
  validateGetCategories,
};