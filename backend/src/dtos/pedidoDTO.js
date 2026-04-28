function toPedidoDTO(pedido) {
	return {
		id: pedido.id,
		usuario_id: pedido.usuario_id,
		cliente: pedido.usuario
			? {
					id: pedido.usuario.id,
					nombre: pedido.usuario.nombre,
					correo_electronico: pedido.usuario.correo_electronico,
			  }
			: null,
		fecha_pedido: pedido.fecha_pedido,
		estado: pedido.estado,
		total: Number(pedido.total),
		metodo_pago_simulado: pedido.metodo_pago_simulado,
		detalles: (pedido.detalles || []).map((d) => ({
			id: d.id,
			producto_id: d.producto_id,
			nombre_producto: d.producto?.nombre || null,
			categoria: d.producto?.categoria || null,
			imagen_url: d.producto?.imagen_url || null,
			cantidad: d.cantidad,
			precio_unitario: Number(d.precio_unitario),
			subtotal: Number(d.subtotal),
		})),
	};
}

module.exports = { toPedidoDTO };
