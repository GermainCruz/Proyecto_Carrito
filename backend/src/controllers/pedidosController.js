const pedidoService = require("../services/pedidoService");

async function checkout(req, res, next) {
	try {
		const pedido = await pedidoService.checkout(
			req.user.id,
			req.body.metodo_pago_simulado,
			req.body.fecha_pedido_cliente
		);
		res.status(201).json({ ok: true, data: pedido });
	} catch (error) {
		next(error);
	}
}

async function listMine(req, res, next) {
	try {
		const pedidos = await pedidoService.listMine(req.user.id);
		res.status(200).json({ ok: true, data: pedidos });
	} catch (error) {
		next(error);
	}
}

async function listAll(req, res, next) {
	try {
		const { fechaDesde, fechaHasta, usuarioId } = req.query;
		const pedidos = await pedidoService.listAll({ fechaDesde, fechaHasta, usuarioId });
		res.status(200).json({ ok: true, data: pedidos });
	} catch (error) {
		next(error);
	}
}

async function updateEstado(req, res, next) {
	try {
		const pedido = await pedidoService.updateEstado(Number(req.params.id), req.body.estado);
		res.status(200).json({ ok: true, data: pedido });
	} catch (error) {
		next(error);
	}
}

module.exports = { checkout, listMine, listAll, updateEstado };
