const { Op } = require("sequelize");
const { Producto } = require("../models");

async function findAll({ q, categoria, minPrecio, maxPrecio, stockMin, limit = 30, offset = 0 }) {
	const where = {};

	if (q) {
		where[Op.or] = [
			{ nombre: { [Op.iLike]: `%${q}%` } },
			{ descripcion: { [Op.iLike]: `%${q}%` } },
			{ categoria: { [Op.iLike]: `%${q}%` } },
		];
	}

	if (categoria) {
		where.categoria = { [Op.iLike]: `%${categoria}%` };
	}

	if (minPrecio !== undefined || maxPrecio !== undefined) {
		where.precio = {};
		if (minPrecio !== undefined) {
			where.precio[Op.gte] = minPrecio;
		}
		if (maxPrecio !== undefined) {
			where.precio[Op.lte] = maxPrecio;
		}
	}

	if (stockMin !== undefined) {
		where.stock = { [Op.gte]: stockMin };
	}

	return Producto.findAndCountAll({
		where,
		order: [["id", "DESC"]],
		limit,
		offset,
	});
}

async function findById(id) {
	return Producto.findByPk(id);
}

async function create(data) {
	return Producto.create(data);
}

async function update(producto, data) {
	return producto.update(data);
}

async function remove(producto) {
	return producto.destroy();
}

async function findAllCategorias() {
	const { sequelize } = require("../models");
	const [rows] = await sequelize.query(
		`SELECT DISTINCT categoria FROM productos WHERE categoria IS NOT NULL AND categoria <> '' ORDER BY categoria ASC`
	);
	return rows.map((r) => r.categoria);
}

module.exports = { findAll, findById, create, update, remove, findAllCategorias };
