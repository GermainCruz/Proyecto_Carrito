const carritoService = require("../services/carritoService");

async function getMyCart(req, res, next) {
	try {
		const cart = await carritoService.getMyCart(req.user.id);
		res.status(200).json({ ok: true, data: cart });
	} catch (error) {
		next(error);
	}
}

async function addItem(req, res, next) {
	try {
		const cart = await carritoService.addItem(req.user.id, req.body.producto_id, req.body.cantidad);
		res.status(200).json({ ok: true, data: cart });
	} catch (error) {
		next(error);
	}
}

async function updateItem(req, res, next) {
	try {
		const cart = await carritoService.updateItem(req.user.id, Number(req.params.productoId), req.body.cantidad);
		res.status(200).json({ ok: true, data: cart });
	} catch (error) {
		next(error);
	}
}

async function removeItem(req, res, next) {
	try {
		const cart = await carritoService.removeItem(req.user.id, Number(req.params.productoId));
		res.status(200).json({ ok: true, data: cart });
	} catch (error) {
		next(error);
	}
}

module.exports = { getMyCart, addItem, updateItem, removeItem };
