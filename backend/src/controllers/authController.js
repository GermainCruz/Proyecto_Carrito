const authService = require("../services/authService");

async function register(req, res, next) {
	try {
		const user = await authService.register(req.body);
		res.status(201).json({ ok: true, data: user });
	} catch (error) {
		next(error);
	}
}

async function login(req, res, next) {
	try {
		const user = await authService.login(req.body.correo_electronico, req.body.contrasena);
		req.session.user = user;
		res.status(200).json({ ok: true, data: user });
	} catch (error) {
		next(error);
	}
}

function logout(req, res) {
	req.session.destroy(() => {
		res.status(200).json({ ok: true, message: "Sesion cerrada" });
	});
}

function me(req, res) {
	res.status(200).json({ ok: true, data: req.user });
}

module.exports = { register, login, logout, me };
