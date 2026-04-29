const { MetodoPago, TransaccionPago, Pedido } = require("../models");

async function listMetodosActivos() {
	return MetodoPago.findAll({
		where: { activo: true },
		order: [["id", "ASC"]],
	});
}

async function findMetodoById(id, options = {}) {
	return MetodoPago.findByPk(id, options);
}

async function findMetodoByCodigo(codigo) {
	return MetodoPago.findOne({ where: { codigo } });
}

async function createTransaccion(data, options = {}) {
	return TransaccionPago.create(data, options);
}

async function updateTransaccion(transaccion, data, options = {}) {
	return transaccion.update(data, options);
}

async function findTransaccionById(id, options = {}) {
	return TransaccionPago.findByPk(id, {
		...options,
		include: [
			{ model: MetodoPago, as: "metodo_pago" },
			{ model: Pedido, as: "pedido" },
		],
	});
}

async function findTransaccionByCodigo(codigo) {
	return TransaccionPago.findOne({
		where: { codigo_transaccion: codigo },
		include: [
			{ model: MetodoPago, as: "metodo_pago" },
			{ model: Pedido, as: "pedido" },
		],
	});
}

async function listTransaccionesByUsuario(usuarioId) {
	return TransaccionPago.findAll({
		where: { usuario_id: usuarioId },
		include: [
			{ model: MetodoPago, as: "metodo_pago" },
			{ model: Pedido, as: "pedido" },
		],
		order: [["id", "DESC"]],
	});
}

async function listAllTransacciones({ fechaDesde, fechaHasta, estado, metodoPagoId } = {}) {
	const { Op } = require("sequelize");
	const where = {};

	if (fechaDesde || fechaHasta) {
		where.fecha_iniciada = {};
		if (fechaDesde) where.fecha_iniciada[Op.gte] = new Date(`${fechaDesde}T00:00:00`);
		if (fechaHasta) where.fecha_iniciada[Op.lte] = new Date(`${fechaHasta}T23:59:59`);
	}

	if (estado) where.estado = estado;
	if (metodoPagoId) where.metodo_pago_id = Number(metodoPagoId);

	return TransaccionPago.findAll({
		where,
		include: [
			{ model: MetodoPago, as: "metodo_pago" },
			{ model: Pedido, as: "pedido" },
		],
		order: [["id", "DESC"]],
	});
}

module.exports = {
	listMetodosActivos,
	findMetodoById,
	findMetodoByCodigo,
	createTransaccion,
	updateTransaccion,
	findTransaccionById,
	findTransaccionByCodigo,
	listTransaccionesByUsuario,
	listAllTransacciones,
};
