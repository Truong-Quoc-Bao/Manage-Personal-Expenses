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
router.post("/accounts", validate(), CreateAccount);
router.get("/accounts", getAccountsController);
router.put("/accounts", validate(), updateAccountController);
router.delete("/accounts", deleteAccountController);
router.get("/accounts/total-balance", getTotalBalanceController);
module.exports = router;
