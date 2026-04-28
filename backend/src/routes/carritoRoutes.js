const express = require("express");
const { body } = require("express-validator");

const carritoController = require("../controllers/carritoController");
const { requireAuth } = require("../middlewares/authMiddleware");
const { authorizeRoles } = require("../middlewares/roleMiddleware");
const { validateRequest } = require("../middlewares/validationMiddleware");

const router = express.Router();

router.use(requireAuth, authorizeRoles("cliente", "admin", "gestor"));

router.get("/", carritoController.getMyCart);
router.post(
	"/items",
	[body("producto_id").isInt({ min: 1 }), body("cantidad").isInt({ min: 1, max: 100 }), validateRequest],
	carritoController.addItem
);
router.patch(
	"/items/:productoId",
	[body("cantidad").isInt({ min: 1, max: 100 }), validateRequest],
	carritoController.updateItem
);
router.delete("/items/:productoId", carritoController.removeItem);

module.exports = router;
