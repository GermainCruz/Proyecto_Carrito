const express = require("express");
const dashboardController = require("../controllers/dashboardController");
const { requireAuth } = require("../middlewares/authMiddleware");
const { authorizeRoles } = require("../middlewares/roleMiddleware");

const router = express.Router();

router.use(requireAuth, authorizeRoles("admin", "gestor"));
router.get("/kpis", dashboardController.getKPIs);
router.get("/ventas-diarias", dashboardController.getVentasDiarias);
router.get("/categorias", dashboardController.getCategorias);
router.get("/estadisticas-descriptivas", dashboardController.getDescriptiveStats);

module.exports = router;
