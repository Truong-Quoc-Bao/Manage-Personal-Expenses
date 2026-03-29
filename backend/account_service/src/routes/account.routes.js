const express = require("express");
const {
  CreateAccount,
  getAccountsController,
} = require("../controllers/account.controller");

const router = express.Router();
router.post("/accounts", CreateAccount);
router.get("/accounts", getAccountsController);
module.exports = router;
