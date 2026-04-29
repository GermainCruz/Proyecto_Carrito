const pedidoRepository = require("../repositories/pedidoRepository");
const { toPedidoDTO } = require("../dtos/pedidoDTO");

async function listMine(usuarioId) {
	const pedidos = await pedidoRepository.listByUsuario(usuarioId);
	return pedidos.map(toPedidoDTO);
}

async function listAll(filters = {}) {
	const pedidos = await pedidoRepository.listAll(filters);
	return pedidos.map(toPedidoDTO);
}

async function findById(id) {
	const pedido = await pedidoRepository.findById(id);
	if (!pedido) {
		const error = new Error("Pedido no encontrado");
		error.status = 404;
		throw error;
	}
	return toPedidoDTO(pedido);
}

async function updateEstado(id, estado) {
	const pedido = await pedidoRepository.findById(id);
	if (!pedido) {
		const error = new Error("Pedido no encontrado");
		error.status = 404;
		throw error;
	}

	await pedido.update({ estado });
	const refreshed = await pedidoRepository.findById(id);
	return toPedidoDTO(refreshed);
}

module.exports = { listMine, listAll, findById, updateEstado };
