const { sequelize, Producto } = require("../models");
const carritoRepository = require("../repositories/carritoRepository");
const pedidoRepository = require("../repositories/pedidoRepository");
const { toPedidoDTO } = require("../dtos/pedidoDTO");
const { buildResumen } = require("./carritoService");
const MAX_STOCK = 100;

async function checkout(usuarioId, metodoPagoSimulado, fechaPedidoCliente) {
	return sequelize.transaction(async (transaction) => {
		const carrito = await carritoRepository.getOrCreateByUserId(usuarioId);
		const items = await carritoRepository.getItems(carrito.id);

		if (!items.length) {
			const error = new Error("El carrito esta vacio");
			error.status = 400;
			throw error;
		}

		for (const item of items) {
			if (Number(item.cantidad) > MAX_STOCK) {
				const error = new Error("La cantidad maxima permitida por producto es 100");
				error.status = 400;
				throw error;
			}

			const producto = await Producto.findByPk(item.producto_id, { transaction, lock: true });
			if (!producto || producto.stock < item.cantidad) {
				const error = new Error(`Stock insuficiente para ${item.producto?.nombre || "producto"}`);
				error.status = 400;
				throw error;
			}
		}

		const resumen = buildResumen(items);
		const pedido = await pedidoRepository.createPedido(
			{
				usuario_id: usuarioId,
				fecha_pedido: fechaPedidoCliente ? new Date(fechaPedidoCliente) : new Date(),
				estado: "pagado",
				total: resumen.total,
				metodo_pago_simulado: metodoPagoSimulado || "tarjeta_simulada",
			},
			{ transaction }
		);

		for (const item of items) {
			const subtotal = Number((Number(item.precio_unitario) * Number(item.cantidad)).toFixed(2));

			await pedidoRepository.createDetalle(
				{
					pedido_id: pedido.id,
					producto_id: item.producto_id,
					cantidad: item.cantidad,
					precio_unitario: item.precio_unitario,
					subtotal,
				},
				{ transaction }
			);

			await Producto.decrement("stock", {
				by: item.cantidad,
				where: { id: item.producto_id },
				transaction,
			});
		}

		await carritoRepository.clearCart(carrito.id, { transaction });

		const pedidoCreado = await pedidoRepository.findById(pedido.id, { transaction });
		if (!pedidoCreado) {
			const error = new Error("No se pudo recuperar el pedido generado");
			error.status = 500;
			throw error;
		}
		return toPedidoDTO(pedidoCreado);
	});
}

async function listMine(usuarioId) {
	const pedidos = await pedidoRepository.listByUsuario(usuarioId);
	return pedidos.map(toPedidoDTO);
}

async function listAll(filters = {}) {
	const pedidos = await pedidoRepository.listAll(filters);
	return pedidos.map(toPedidoDTO);
}

async function updateEstado(id, estado) {
	const pedido = await pedidoRepository.findById(id);
	if (!pedido) {
		const error = new Error("Pedido no encontrado");
		error.status = 404;
		throw error;
	}

	await pedido.update({ estado });
	return pedido;
}

module.exports = { checkout, listMine, listAll, updateEstado };
