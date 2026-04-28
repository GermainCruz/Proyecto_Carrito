const { Usuario } = require("../models");

async function findByEmail(correo) {
	return Usuario.findOne({ where: { correo_electronico: correo } });
}

async function findById(id) {
	return Usuario.findByPk(id);
}

async function create(data) {
	return Usuario.create(data);
}

module.exports = { findByEmail, findById, create };
