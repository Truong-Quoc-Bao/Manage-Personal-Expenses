const express = require("express");
const { getProfile, updateUser } = require("../controllers/user.controller");

const router = express.Router();

router.get("/profile", getProfile);
router.put("/profile", updateUser);

module.exports = router;
