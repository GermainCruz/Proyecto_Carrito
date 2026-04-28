const estadisticasService = require("../services/estadisticasService");

async function getKPIs(_req, res, next) {
	try {
		const data = await estadisticasService.getDashboardKPIs();
		res.status(200).json({ ok: true, data });
	} catch (error) {
		next(error);
	}
}

async function getVentasDiarias(_req, res, next) {
	try {
		const data = await estadisticasService.getVentasDiarias();
		res.status(200).json({ ok: true, data });
	} catch (error) {
		next(error);
	}
}

async function getCategorias(_req, res, next) {
	try {
		const data = await estadisticasService.getCategorias();
		res.status(200).json({ ok: true, data });
	} catch (error) {
		next(error);
	}
}

async function getDescriptiveStats(_req, res, next) {
	try {
		const data = await estadisticasService.getDescriptiveStats();
		res.status(200).json({ ok: true, data });
	} catch (error) {
		next(error);
	}
}

async function getEstadosPedidos(_req, res, next) {
	try {
		const data = await estadisticasService.getEstadosPedidos();
		res.status(200).json({ ok: true, data });
	} catch (error) {
		next(error);
	}
}

async function getTopProductos(_req, res, next) {
	try {
		const data = await estadisticasService.getTopProductos();
		res.status(200).json({ ok: true, data });
	} catch (error) {
		next(error);
	}
}

module.exports = { getKPIs, getVentasDiarias, getCategorias, getDescriptiveStats, getEstadosPedidos, getTopProductos };
