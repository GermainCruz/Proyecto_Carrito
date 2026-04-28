const usuarioRepository = require("../repositories/usuarioRepository");
const { hashPassword, comparePassword } = require("../utils/bcryptHelper");
const { toUsuarioDTO } = require("../dtos/usuarioDTO");

async function register(payload) {
	const existing = await usuarioRepository.findByEmail(payload.correo_electronico);
	if (existing) {
		const error = new Error("El correo ya esta registrado");
		error.status = 409;
		throw error;
	}

	const usuario = await usuarioRepository.create({
		...payload,
		contrasena: hashPassword(payload.contrasena),
		rol: payload.rol || "cliente",
	});

	return toUsuarioDTO(usuario);
}

async function login(correo, contrasena) {
	const usuario = await usuarioRepository.findByEmail(correo);
	if (!usuario || !usuario.activo || !comparePassword(contrasena, usuario.contrasena)) {
		const error = new Error("Credenciales invalidas");
		error.status = 401;
		throw error;
	}

	return toUsuarioDTO(usuario);
}

module.exports = { register, login };
