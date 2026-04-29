function toTransaccionDTO(transaccion) {
	if (!transaccion) return null;

	return {
		id: transaccion.id,
		codigo_transaccion: transaccion.codigo_transaccion,
		usuario_id: transaccion.usuario_id,
		pedido_id: transaccion.pedido_id,
		monto: Number(transaccion.monto),
		moneda: transaccion.moneda,
		estado: transaccion.estado,
		metodo_pago: transaccion.metodo_pago
			? {
					id: transaccion.metodo_pago.id,
					codigo: transaccion.metodo_pago.codigo,
					nombre: transaccion.metodo_pago.nombre,
					tipo: transaccion.metodo_pago.tipo,
			  }
			: null,
		tarjeta: transaccion.tarjeta_ultimos_4
			? {
					titular: transaccion.tarjeta_titular,
					ultimos_4: transaccion.tarjeta_ultimos_4,
					marca: transaccion.tarjeta_marca,
			  }
			: null,
		telefono_billetera: transaccion.telefono_billetera || null,
		codigo_autorizacion: transaccion.codigo_autorizacion || null,
		referencia_externa: transaccion.referencia_externa || null,
		motivo_rechazo: transaccion.motivo_rechazo || null,
		fecha_iniciada: transaccion.fecha_iniciada,
		fecha_procesada: transaccion.fecha_procesada,
	};
}

module.exports = { toTransaccionDTO };
