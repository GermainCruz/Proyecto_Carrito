function toUsuarioDTO(usuario) {
	return {
		id: usuario.id,
		nombre: usuario.nombre,
		correo_electronico: usuario.correo_electronico,
		rol: usuario.rol,
		activo: usuario.activo,
		fecha_registro: usuario.fecha_registro,
	};
}

module.exports = { toUsuarioDTO };
