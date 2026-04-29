const { Pedido, DetallePedido, Producto, Usuario, MetodoPago, TransaccionPago } = require("../models");

const includeFull = [
	{ model: Usuario, as: "usuario", attributes: ["id", "nombre", "correo_electronico", "rol"] },
	{ model: MetodoPago, as: "metodo_pago" },
	{ model: TransaccionPago, as: "transaccion_pago" },
	{
		model: DetallePedido,
		as: "detalles",
		include: [{ model: Producto, as: "producto" }],
	},
];

async function createPedido(data, options = {}) {
	return Pedido.create(data, options);
}

async function createDetalle(data, options = {}) {
	return DetallePedido.create(data, {
		...options,
		fields: ["pedido_id", "producto_id", "cantidad", "precio_unitario", "subtotal"],
	});
}

async function listByUsuario(usuarioId) {
	return Pedido.findAll({
		where: { usuario_id: usuarioId },
		include: includeFull,
		order: [["id", "DESC"]],
	});
}

async function listAll({ fechaDesde, fechaHasta, usuarioId } = {}) {
	const { Op } = require("sequelize");
	const where = {};

	if (fechaDesde || fechaHasta) {
		where.fecha_pedido = {};
		if (fechaDesde) where.fecha_pedido[Op.gte] = new Date(`${fechaDesde}T00:00:00`);
		if (fechaHasta) where.fecha_pedido[Op.lte] = new Date(`${fechaHasta}T23:59:59`);
	}

	if (usuarioId) {
		where.usuario_id = Number(usuarioId);
	}

	return Pedido.findAll({
		where,
		include: includeFull,
		order: [["id", "DESC"]],
	});
}

async function findById(id, options = {}) {
	return Pedido.findByPk(id, {
		...options,
		include: includeFull,
	});
}

module.exports = { createPedido, createDetalle, listByUsuario, listAll, findById };
