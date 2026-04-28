function errorHandler(err, _req, res, _next) {
	const status = err.status || 500;

	res.status(status).json({
		ok: false,
		message: err.message || "Error interno del servidor",
	});
}

module.exports = errorHandler;
