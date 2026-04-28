function toProductoDTO(producto) {
	return {
		id: producto.id,
		nombre: producto.nombre,
		descripcion: producto.descripcion,
		precio: Number(producto.precio),
		stock: producto.stock,
		categoria: producto.categoria,
		imagen_url: producto.imagen_url,
		fecha_creacion: producto.fecha_creacion,
	};
}

module.exports = { toProductoDTO };
