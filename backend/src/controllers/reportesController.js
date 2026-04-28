const pdfService = require("../services/pdfService");

async function getOperationalPdf(req, res, next) {
	try {
		const { startDate, endDate } = req.query;
		const buffer = await pdfService.generateOperationalPdf(startDate, endDate);

		res.setHeader("Content-Type", "application/pdf");
		res.setHeader("Content-Disposition", "attachment; filename=reporte-operacional.pdf");
		res.status(200).send(buffer);
	} catch (error) {
		next(error);
	}
}

async function getManagementPdf(req, res, next) {
	try {
		const { startDate, endDate } = req.query;
		const buffer = await pdfService.generateManagementPdf(startDate, endDate);

		res.setHeader("Content-Type", "application/pdf");
		res.setHeader("Content-Disposition", "attachment; filename=reporte-gestion.pdf");
		res.status(200).send(buffer);
	} catch (error) {
		next(error);
	}
}

module.exports = { getOperationalPdf, getManagementPdf };
