const { Carrito, CarritoProducto, Producto } = require("../models");

async function getOrCreateByUserId(usuarioId) {
	const [carrito] = await Carrito.findOrCreate({
		where: { usuario_id: usuarioId },
		defaults: { usuario_id: usuarioId },
	});
	return carrito;
}

async function getItems(carritoId) {
	return CarritoProducto.findAll({
		where: { carrito_id: carritoId },
		include: [{ model: Producto, as: "producto" }],
		order: [["id", "ASC"]],
	});
}

async function findItem(carritoId, productoId) {
	return CarritoProducto.findOne({ where: { carrito_id: carritoId, producto_id: productoId } });
}

async function createItem(data, options = {}) {
	return CarritoProducto.create(data, options);
}

async function updateItem(item, data, options = {}) {
	return item.update(data, options);
}

async function removeItem(item, options = {}) {
	return item.destroy(options);
}

async function clearCart(carritoId, options = {}) {
	return CarritoProducto.destroy({ where: { carrito_id: carritoId }, ...options });
}

module.exports = {
	getOrCreateByUserId,
	getItems,
	findItem,
	createItem,
	updateItem,
	removeItem,
	clearCart,
};
