const productoRepository = require("../repositories/productoRepository");
const { toProductoDTO } = require("../dtos/productoDTO");
const MAX_STOCK = 100;

function validateStock(payload) {
	if (payload.stock !== undefined && Number(payload.stock) > MAX_STOCK) {
		const error = new Error("El stock maximo permitido por producto es 100");
		error.status = 400;
		throw error;
	}
}

async function list(filters) {
	const result = await productoRepository.findAll(filters);
	return {
		total: result.count,
		data: result.rows.map(toProductoDTO),
	};
}

async function getById(id) {
	const producto = await productoRepository.findById(id);
	if (!producto) {
		const error = new Error("Producto no encontrado");
		error.status = 404;
		throw error;
	}
	return toProductoDTO(producto);
}

async function create(payload) {
	validateStock(payload);
	const producto = await productoRepository.create(payload);
	return toProductoDTO(producto);
}

async function update(id, payload) {
	validateStock(payload);
	const producto = await productoRepository.findById(id);
	if (!producto) {
		const error = new Error("Producto no encontrado");
		error.status = 404;
		throw error;
	}
	const updated = await productoRepository.update(producto, payload);
	return toProductoDTO(updated);
}

async function remove(id) {
	const producto = await productoRepository.findById(id);
	if (!producto) {
		const error = new Error("Producto no encontrado");
		error.status = 404;
		throw error;
	}
	await productoRepository.remove(producto);
}

async function listCategorias() {
	const result = await productoRepository.findAllCategorias();
	return result;
}

module.exports = { list, getById, create, update, remove, listCategorias };
