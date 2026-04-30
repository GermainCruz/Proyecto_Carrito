const path = require("path");
const productoService = require("../services/productoService");

async function list(req, res, next) {
	try {
		const result = await productoService.list({
			q: req.query.q,
			categoria: req.query.categoria,
			minPrecio: req.query.minPrecio ? Number(req.query.minPrecio) : undefined,
			maxPrecio: req.query.maxPrecio ? Number(req.query.maxPrecio) : undefined,
			stockMin: req.query.stockMin ? Number(req.query.stockMin) : undefined,
			limit: Number(req.query.limit || 30),
			offset: Number(req.query.offset || 0),
		});
		res.status(200).json({ ok: true, ...result });
	} catch (error) {
		next(error);
	}
}

async function getById(req, res, next) {
	try {
		const result = await productoService.getById(Number(req.params.id));
		res.status(200).json({ ok: true, data: result });
	} catch (error) {
		next(error);
	}
}

async function create(req, res, next) {
	try {
		const result = await productoService.create(req.body);
		res.status(201).json({ ok: true, data: result });
	} catch (error) {
		next(error);
	}
}

async function update(req, res, next) {
	try {
		const result = await productoService.update(Number(req.params.id), req.body);
		res.status(200).json({ ok: true, data: result });
	} catch (error) {
		next(error);
	}
}

async function remove(req, res, next) {
	try {
		await productoService.remove(Number(req.params.id));
		res.status(204).send();
	} catch (error) {
		next(error);
	}
}

async function listCategorias(req, res, next) {
	try {
		const categorias = await productoService.listCategorias();
		res.status(200).json({ ok: true, data: categorias });
	} catch (error) {
		next(error);
	}
}

async function uploadImagen(req, res, next) {
	try {
		if (!req.file) {
			const error = new Error("No se recibió ningún archivo");
			error.status = 400;
			throw error;
		}
		const relativePath = `/uploads/${req.file.filename}`;
		res.status(200).json({ ok: true, imagen_url: relativePath });
	} catch (error) {
		next(error);
	}
}

module.exports = { list, getById, create, update, remove, uploadImagen, listCategorias };
