const { sequelize, Producto } = require("../models");
const carritoRepository = require("../repositories/carritoRepository");

const TAX_RATE = Number(process.env.TAX_RATE || 0.18);
const MAX_STOCK = 100;

function buildResumen(items) {
	const subtotal = items.reduce((acc, item) => acc + Number(item.cantidad) * Number(item.precio_unitario), 0);
	const impuestos = subtotal * TAX_RATE;
	const total = subtotal + impuestos;

	return {
		subtotal: Number(subtotal.toFixed(2)),
		impuestos: Number(impuestos.toFixed(2)),
		total: Number(total.toFixed(2)),
	};
}

function mapItem(item) {
	return {
		id: item.id,
		producto_id: item.producto_id,
		nombre: item.producto?.nombre,
		precio_unitario: Number(item.precio_unitario),
		cantidad: item.cantidad,
		stock_disponible: item.producto?.stock,
		subtotal: Number((Number(item.precio_unitario) * item.cantidad).toFixed(2)),
	};
}

async function getMyCart(usuarioId) {
	const carrito = await carritoRepository.getOrCreateByUserId(usuarioId);
	const items = await carritoRepository.getItems(carrito.id);
	const mapped = items.map(mapItem);

	return {
		carrito_id: carrito.id,
		items: mapped,
		resumen: buildResumen(mapped),
	};
}

async function addItem(usuarioId, productoId, cantidad) {
	return sequelize.transaction(async (transaction) => {
		if (cantidad > MAX_STOCK) {
			const error = new Error("La cantidad maxima permitida por producto es 100");
			error.status = 400;
			throw error;
		}

		const carrito = await carritoRepository.getOrCreateByUserId(usuarioId);
		const producto = await Producto.findByPk(productoId, { transaction });

		if (!producto) {
			const error = new Error("Producto no encontrado");
			error.status = 404;
			throw error;
		}

		if (producto.stock < cantidad) {
			const error = new Error("Stock insuficiente");
			error.status = 400;
			throw error;
		}

		const existing = await carritoRepository.findItem(carrito.id, productoId);

		if (existing) {
			const newQty = existing.cantidad + cantidad;
			if (newQty > MAX_STOCK) {
				const error = new Error("La cantidad maxima permitida por producto es 100");
				error.status = 400;
				throw error;
			}

			if (producto.stock < newQty) {
				const error = new Error("Stock insuficiente para esa cantidad");
				error.status = 400;
				throw error;
			}
			await carritoRepository.updateItem(existing, { cantidad: newQty }, { transaction });
		} else {
			await carritoRepository.createItem(
				{
					carrito_id: carrito.id,
					producto_id: productoId,
					cantidad,
					precio_unitario: producto.precio,
				},
				{ transaction }
			);
		}

		return getMyCart(usuarioId);
	});
}

async function updateItem(usuarioId, productoId, cantidad) {
	return sequelize.transaction(async (transaction) => {
		if (cantidad > MAX_STOCK) {
			const error = new Error("La cantidad maxima permitida por producto es 100");
			error.status = 400;
			throw error;
		}

		const carrito = await carritoRepository.getOrCreateByUserId(usuarioId);
		const item = await carritoRepository.findItem(carrito.id, productoId);
		if (!item) {
			const error = new Error("Item no encontrado en carrito");
			error.status = 404;
			throw error;
		}

		const producto = await Producto.findByPk(productoId, { transaction });
		if (!producto || producto.stock < cantidad) {
			const error = new Error("Stock insuficiente");
			error.status = 400;
			throw error;
		}

		await carritoRepository.updateItem(item, { cantidad }, { transaction });
		return getMyCart(usuarioId);
	});
}

async function removeItem(usuarioId, productoId) {
	return sequelize.transaction(async (transaction) => {
		const carrito = await carritoRepository.getOrCreateByUserId(usuarioId);
		const item = await carritoRepository.findItem(carrito.id, productoId);
		if (!item) {
			return getMyCart(usuarioId);
		}
		await carritoRepository.removeItem(item, { transaction });
		return getMyCart(usuarioId);
	});
}

module.exports = { getMyCart, addItem, updateItem, removeItem, buildResumen };
