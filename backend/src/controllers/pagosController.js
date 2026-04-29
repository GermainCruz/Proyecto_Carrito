const pagoService = require("../services/pagoService");

async function listarMetodos(_req, res, next) {
	try {
		const metodos = await pagoService.listarMetodosActivos();
		res.status(200).json({ ok: true, data: metodos });
	} catch (error) {
		next(error);
	}
}

async function procesarPago(req, res, next) {
	try {
		const resultado = await pagoService.procesarPago(req.user.id, req.body);
		res.status(201).json({ ok: true, data: resultado });
	} catch (error) {
		// Si el error trae la transaccion (rechazada), la incluimos en la respuesta
		if (error.transaccion) {
			return res.status(error.status || 402).json({
				ok: false,
				message: error.message,
				data: { transaccion: error.transaccion },
			});
		}
		next(error);
	}
}

async function obtenerTransaccion(req, res, next) {
	try {
		const transaccion = await pagoService.obtenerTransaccion(
			req.params.codigo,
			req.user.id,
			req.user.rol
		);
		res.status(200).json({ ok: true, data: transaccion });
	} catch (error) {
		next(error);
	}
}

async function listarMisTransacciones(req, res, next) {
	try {
		const data = await pagoService.listarMisTransacciones(req.user.id);
		res.status(200).json({ ok: true, data });
	} catch (error) {
		next(error);
	}
}

async function listarTodasTransacciones(req, res, next) {
	try {
		const { fechaDesde, fechaHasta, estado, metodoPagoId } = req.query;
		const data = await pagoService.listarTodasTransacciones({
			fechaDesde,
			fechaHasta,
			estado,
			metodoPagoId,
		});
		res.status(200).json({ ok: true, data });
	} catch (error) {
		next(error);
	}
}

module.exports = {
	listarMetodos,
	procesarPago,
	obtenerTransaccion,
	listarMisTransacciones,
	listarTodasTransacciones,
};
