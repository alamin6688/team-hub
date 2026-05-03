const express = require("express");
const { AuthController } = require("./auth.controller");

const auth = require("../../middleware/auth");

const router = express.Router();

router.post("/register", AuthController.register);
router.post("/login", AuthController.login);
router.post("/logout", AuthController.logout);
router.post("/refresh-token", AuthController.refreshToken);
router.get("/me", auth(), AuthController.getMe);

module.exports = router;
