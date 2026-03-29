const express = require("express");
const { CreateAccount } = require("../controllers/account.controller");

const router = express.Router();
router.post("/accounts", CreateAccount);

module.exports = router;
