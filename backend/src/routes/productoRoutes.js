const express = require("express");
const { body } = require("express-validator");

const productosController = require("../controllers/productosController");
const { requireAuth } = require("../middlewares/authMiddleware");
const { authorizeRoles } = require("../middlewares/roleMiddleware");
const { validateRequest } = require("../middlewares/validationMiddleware");
const { upload } = require("../config/upload");

const router = express.Router();

router.post(
	"/upload-imagen",
	requireAuth,
	authorizeRoles("admin", "gestor"),
	upload.single("imagen"),
	productosController.uploadImagen
);

router.get("/", productosController.list);
router.get("/categorias", productosController.listCategorias);
router.get("/:id", productosController.getById);

router.post(
	"/",
	requireAuth,
	authorizeRoles("admin", "gestor"),
	[
		body("nombre").isLength({ min: 2 }),
		body("precio").isFloat({ min: 0 }),
		body("stock").isInt({ min: 0, max: 100 }),
		validateRequest,
	],
	productosController.create
);

router.put(
	"/:id",
	requireAuth,
	authorizeRoles("admin", "gestor"),
	[
		body("nombre").optional().isLength({ min: 2 }),
		body("precio").optional().isFloat({ min: 0 }),
		body("stock").optional().isInt({ min: 0, max: 100 }),
		validateRequest,
	],
	productosController.update
);

router.delete("/:id", requireAuth, authorizeRoles("admin", "gestor"), productosController.remove);

module.exports = router;
