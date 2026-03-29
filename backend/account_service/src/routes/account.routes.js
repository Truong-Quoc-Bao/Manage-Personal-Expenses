const express = require("express");
const {
  CreateAccount,
  getAccountsController,
  updateAccountController,
} = require("../controllers/account.controller");

const router = express.Router();
router.post("/accounts", CreateAccount);
router.get("/accounts", getAccountsController);
router.put("/accounts", updateAccountController);
module.exports = router;
