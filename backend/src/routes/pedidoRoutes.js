const express = require("express");
const { body } = require("express-validator");

const pedidosController = require("../controllers/pedidosController");
const { requireAuth } = require("../middlewares/authMiddleware");
const { authorizeRoles } = require("../middlewares/roleMiddleware");
const { validateRequest } = require("../middlewares/validationMiddleware");

const router = express.Router();

router.use(requireAuth);

router.get("/mis", authorizeRoles("cliente", "admin", "gestor"), pedidosController.listMine);
router.get("/", authorizeRoles("admin", "gestor"), pedidosController.listAll);
router.patch(
	"/:id/estado",
	authorizeRoles("admin", "gestor"),
	[body("estado").isIn(["pendiente", "pagado", "enviado", "entregado", "cancelado"]), validateRequest],
	pedidosController.updateEstado
);

module.exports = router;
