const express = require("express");
const {
  getBudgetByUserIdController,
  getBudgetByBudgetIdController,
  createBudgetController,
  updateBudgetController,
  deleteBudgetController,
} = require("../controllers/budget.controller");
const validate = require("../middlewares/validation.middleware");

const router = express.Router();

router.get("/", getBudgetByUserIdController);
router.get("/:id", getBudgetByBudgetIdController);
router.post("/", validate(), createBudgetController);
router.put("/:id", validate(), updateBudgetController);
router.delete("/:id", deleteBudgetController);
module.exports = router;
