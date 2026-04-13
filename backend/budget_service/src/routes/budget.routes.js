const express = require("express");
const {
  getBudgetByUserIdController,
  getBudgetByBudgetIdController,
  createBudgetController,
  updateBudgetController,
} = require("../controllers/budget.controller");
const validate = require("../middlewares/validation.middleware");

const router = express.Router();

router.get("/budgets", validate(), getBudgetByUserIdController);
router.get("/budgets/:id", getBudgetByBudgetIdController);
router.post("/budgets", validate(), createBudgetController);
router.put("/budgets/:id", validate(), updateBudgetController);
module.exports = router;
