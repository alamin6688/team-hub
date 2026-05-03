const express = require("express");
const { UserController } = require("./user.controller");
const auth = require("../../middleware/auth");
const { upload } = require("../../lib/cloudinary");

const router = express.Router();

router.patch("/profile", auth(), UserController.updateProfile);
router.post("/avatar", auth(), upload.single("avatar"), UserController.updateAvatar);

module.exports = router;
