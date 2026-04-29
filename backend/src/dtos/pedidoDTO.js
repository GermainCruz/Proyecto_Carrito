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
		metodo_pago: pedido.metodo_pago
			? {
					id: pedido.metodo_pago.id,
					codigo: pedido.metodo_pago.codigo,
					nombre: pedido.metodo_pago.nombre,
					tipo: pedido.metodo_pago.tipo,
			  }
			: null,
		transaccion_pago: pedido.transaccion_pago
			? {
					id: pedido.transaccion_pago.id,
					codigo_transaccion: pedido.transaccion_pago.codigo_transaccion,
					estado: pedido.transaccion_pago.estado,
					codigo_autorizacion: pedido.transaccion_pago.codigo_autorizacion,
					tarjeta_ultimos_4: pedido.transaccion_pago.tarjeta_ultimos_4,
					tarjeta_marca: pedido.transaccion_pago.tarjeta_marca,
					telefono_billetera: pedido.transaccion_pago.telefono_billetera,
					fecha_procesada: pedido.transaccion_pago.fecha_procesada,
			  }
			: null,
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
