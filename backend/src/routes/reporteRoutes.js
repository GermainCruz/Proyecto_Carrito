const express = require("express");
const { query } = require("express-validator");

const reportesController = require("../controllers/reportesController");
const { requireAuth } = require("../middlewares/authMiddleware");
const { authorizeRoles } = require("../middlewares/roleMiddleware");
const { validateRequest } = require("../middlewares/validationMiddleware");

const router = express.Router();

router.use(requireAuth, authorizeRoles("admin", "gestor"));

const reportValidation = [
	query("startDate").isISO8601().withMessage("startDate debe ser fecha ISO"),
	query("endDate").isISO8601().withMessage("endDate debe ser fecha ISO"),
	validateRequest,
];

router.get("/operacional", reportValidation, reportesController.getOperationalPdf);
router.get("/gestion", reportValidation, reportesController.getManagementPdf);

module.exports = router;
