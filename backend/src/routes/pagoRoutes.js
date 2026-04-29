const express = require("express");
const { body } = require("express-validator");

const pagosController = require("../controllers/pagosController");
const { requireAuth } = require("../middlewares/authMiddleware");
const { authorizeRoles } = require("../middlewares/roleMiddleware");
const { validateRequest } = require("../middlewares/validationMiddleware");

const router = express.Router();

router.use(requireAuth);

// Catalogo publico (para usuarios autenticados): metodos disponibles en la pasarela
router.get("/metodos", pagosController.listarMetodos);

// Procesar un nuevo pago a traves de la pasarela
router.post(
	"/procesar",
	[
		body("metodo_pago_id").isInt({ min: 1 }),
		body("datos_pago").isObject(),
		body("fecha_pedido_cliente").optional().isISO8601(),
		validateRequest,
	],
	authorizeRoles("cliente", "admin", "gestor"),
	pagosController.procesarPago
);

// Mis transacciones (cliente o staff ven las propias)
router.get(
	"/mis-transacciones",
	authorizeRoles("cliente", "admin", "gestor"),
	pagosController.listarMisTransacciones
);

// Listado completo (admin/gestor)
router.get(
	"/transacciones",
	authorizeRoles("admin", "gestor"),
	pagosController.listarTodasTransacciones
);

// Detalle por codigo de transaccion (cliente solo ve las suyas, staff ve todas)
router.get(
	"/transacciones/:codigo",
	authorizeRoles("cliente", "admin", "gestor"),
	pagosController.obtenerTransaccion
);

module.exports = router;
