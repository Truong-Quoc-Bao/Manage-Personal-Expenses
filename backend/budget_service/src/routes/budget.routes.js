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

router.get("/", validate(), getBudgetByUserIdController);
router.get("/:id", getBudgetByBudgetIdController);
router.post("/", validate(), createBudgetController);
router.put("/:id", validate(), updateBudgetController);
router.delete("/:id", validate(), deleteBudgetController);
module.exports = router;
