const express = require("express");
const {
  getBudgetByUserIdController,
  getBudgetByBudgetIdController,
} = require("../controllers/budget.controller");
const validate = require("../middlewares/validation.middleware");

const router = express.Router();

router.post("/budgets", validate(), getBudgetByUserIdController);
router.get("/budgets/:id", getBudgetByBudgetIdController);

module.exports = router;
