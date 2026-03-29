const express = require("express");
const {
  CreateAccount,
  getAccountsController,
  updateAccountController,
  deleteAccountController,
} = require("../controllers/account.controller");

const router = express.Router();
router.post("/accounts", CreateAccount);
router.get("/accounts", getAccountsController);
router.put("/accounts", updateAccountController);
router.delete("/accounts", deleteAccountController);
module.exports = router;
