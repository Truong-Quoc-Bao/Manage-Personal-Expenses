const express = require("express");
const { getProfile, updateUser } = require("../controllers/user.controller");
const validate = require("../middlewares/validation.middleware");

const router = express.Router();

router.get("/profile", getProfile);
router.put("/profile", validate(), updateUser);

module.exports = router;
