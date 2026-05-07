const express = require("express");
const {
  CreateAccount,
  getAccountsController,
  updateAccountController,
  deleteAccountController,
  getTotalBalanceController,
} = require("../controllers/account.controller");
const validate = require("../middlewares/validation.middleware");

const router = express.Router();
router.post("/", validate(), CreateAccount);
router.get("/", getAccountsController);
router.put("/", validate(), updateAccountController);
router.delete("/", deleteAccountController);
router.get("/total-balance", getTotalBalanceController);
module.exports = router;
