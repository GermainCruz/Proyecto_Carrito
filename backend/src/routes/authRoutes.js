const express = require("express");
const { body } = require("express-validator");

const authController = require("../controllers/authController");
const { validateRequest } = require("../middlewares/validationMiddleware");
const { requireAuth } = require("../middlewares/authMiddleware");

const router = express.Router();

router.post(
	"/register",
	[
		body("nombre").isLength({ min: 2 }),
		body("correo_electronico").isEmail(),
		body("contrasena").isLength({ min: 6 }),
		body("rol").optional().isIn(["admin", "gestor", "cliente"]),
		validateRequest,
	],
	authController.register
);

router.post(
	"/login",
	[body("correo_electronico").isEmail(), body("contrasena").isLength({ min: 6 }), validateRequest],
	authController.login
);
router.post("/logout", requireAuth, authController.logout);
router.get("/me", requireAuth, authController.me);

module.exports = router;
