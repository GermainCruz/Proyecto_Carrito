const { validationResult } = require("express-validator");

function validateRequest(req, res, next) {
	const errors = validationResult(req);

	if (!errors.isEmpty()) {
		return res.status(400).json({
			ok: false,
			message: "Error de validacion",
			errors: errors.array().map((e) => ({ campo: e.path, mensaje: e.msg })),
		});
	}

	return next();
}

module.exports = { validateRequest };
