const express = require("express");
const {
  getBudgetByUserIdController,
} = require("../controllers/budget.controller");
const validate = require("../middlewares/validation.middleware");

const router = express.Router();

router.post("/budgets", validate(), getBudgetByUserIdController);

module.exports = router;
