const express = require("express");
const { body } = require("express-validator");

const pedidosController = require("../controllers/pedidosController");
const { requireAuth } = require("../middlewares/authMiddleware");
const { authorizeRoles } = require("../middlewares/roleMiddleware");
const { validateRequest } = require("../middlewares/validationMiddleware");

const router = express.Router();

router.use(requireAuth);

router.post(
	"/checkout",
	[
		body("metodo_pago_simulado").optional().isLength({ min: 3 }),
		body("fecha_pedido_cliente").optional().isISO8601(),
		validateRequest,
	],
	authorizeRoles("cliente", "admin", "gestor"),
	pedidosController.checkout
);
router.get("/mis", authorizeRoles("cliente", "admin", "gestor"), pedidosController.listMine);
router.get("/", authorizeRoles("admin", "gestor"), pedidosController.listAll);
router.patch(
	"/:id/estado",
	authorizeRoles("admin", "gestor"),
	[body("estado").isIn(["pendiente", "pagado", "enviado", "entregado", "cancelado"]), validateRequest],
	pedidosController.updateEstado
);

module.exports = router;
