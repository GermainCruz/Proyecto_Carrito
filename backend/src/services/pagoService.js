const crypto = require("crypto");

const { sequelize, Producto } = require("../models");
const carritoRepository = require("../repositories/carritoRepository");
const pedidoRepository = require("../repositories/pedidoRepository");
const pagoRepository = require("../repositories/pagoRepository");
const { buildResumen } = require("./carritoService");
const { toPedidoDTO } = require("../dtos/pedidoDTO");
const { toTransaccionDTO } = require("../dtos/transaccionDTO");

const MAX_STOCK = 100;

// ─── Utilidades de la pasarela ────────────────────────────────────────────────
function generarCodigoTransaccion() {
	const fecha = new Date();
	const yyyy = fecha.getFullYear();
	const mm = String(fecha.getMonth() + 1).padStart(2, "0");
	const dd = String(fecha.getDate()).padStart(2, "0");
	const random = crypto.randomBytes(4).toString("hex").toUpperCase();
	return `TXN-${yyyy}${mm}${dd}-${random}`;
}

function generarCodigoAutorizacion() {
	return `AUTH-${crypto.randomInt(100000, 999999)}`;
}

function generarReferenciaExterna(prefix) {
	const random = crypto.randomInt(100000, 999999);
	return `REF-${prefix}-${random}`;
}

function detectarMarcaTarjeta(numero) {
	const limpio = String(numero || "").replace(/\D/g, "");
	if (/^4/.test(limpio)) return "visa";
	if (/^(5[1-5]|2[2-7])/.test(limpio)) return "mastercard";
	if (/^3[47]/.test(limpio)) return "amex";
	return null;
}

// Algoritmo de Luhn para validar el numero de tarjeta de forma realista
function validarLuhn(numero) {
	const limpio = String(numero || "").replace(/\D/g, "");
	if (limpio.length < 13 || limpio.length > 19) return false;

	let suma = 0;
	let alternar = false;
	for (let i = limpio.length - 1; i >= 0; i--) {
		let d = parseInt(limpio.charAt(i), 10);
		if (alternar) {
			d *= 2;
			if (d > 9) d -= 9;
		}
		suma += d;
		alternar = !alternar;
	}
	return suma % 10 === 0;
}

function validarVencimiento(mm, yy) {
	const mes = parseInt(mm, 10);
	const anio = parseInt(yy, 10);
	if (Number.isNaN(mes) || Number.isNaN(anio)) return false;
	if (mes < 1 || mes > 12) return false;

	const ahora = new Date();
	const anioActual = ahora.getFullYear() % 100;
	const mesActual = ahora.getMonth() + 1;

	if (anio < anioActual) return false;
	if (anio === anioActual && mes < mesActual) return false;
	return true;
}

// ─── Lógica del simulador de pasarela ────────────────────────────────────────
// Reglas de negocio simuladas para aprobar/rechazar:
//  - Tarjeta:
//      * El número debe pasar el algoritmo de Luhn
//      * Marca detectada debe coincidir con el método elegido (visa/mastercard/amex)
//      * Vencimiento debe ser futuro
//      * CVV debe tener 3-4 dígitos
//      * Si el último dígito es 0 -> se rechaza por "fondos insuficientes" (regla demo)
//  - Billetera:
//      * Teléfono debe tener 9 dígitos y no comenzar con "000"
//      * OTP simulado debe ser 6 dígitos (por defecto cualquiera valido)
//  - Transferencia:
//      * Siempre queda en estado 'procesando' al inicio (banco simula confirmacion)
function simularPasarela(metodoPago, datosPago) {
	const errores = [];

	if (metodoPago.tipo === "tarjeta") {
		const { numero_tarjeta, titular, vencimiento, cvv } = datosPago;
		if (!titular || titular.trim().length < 3) {
			errores.push("Titular invalido");
		}

		const numeroLimpio = String(numero_tarjeta || "").replace(/\D/g, "");
		if (!validarLuhn(numeroLimpio)) {
			errores.push("Numero de tarjeta invalido");
		}

		const marca = detectarMarcaTarjeta(numeroLimpio);
		if (!marca || marca !== metodoPago.codigo) {
			errores.push(`La tarjeta no corresponde al metodo ${metodoPago.nombre}`);
		}

		const [mm, yy] = String(vencimiento || "").split("/");
		if (!validarVencimiento(mm, yy)) {
			errores.push("Tarjeta vencida");
		}

		const cvvLimpio = String(cvv || "").replace(/\D/g, "");
		const cvvLargoEsperado = marca === "amex" ? 4 : 3;
		if (cvvLimpio.length !== cvvLargoEsperado) {
			errores.push(`CVV debe tener ${cvvLargoEsperado} digitos`);
		}

		if (errores.length === 0 && numeroLimpio.endsWith("0")) {
			errores.push("Fondos insuficientes");
		}

		if (errores.length > 0) {
			return {
				aprobado: false,
				motivo: errores[0],
				ultimos_4: numeroLimpio.slice(-4) || null,
				marca,
			};
		}

		return {
			aprobado: true,
			ultimos_4: numeroLimpio.slice(-4),
			marca,
			codigo_autorizacion: generarCodigoAutorizacion(),
			referencia_externa: generarReferenciaExterna(marca === "visa" ? "VS" : marca === "mastercard" ? "MC" : "AX"),
		};
	}

	if (metodoPago.tipo === "billetera") {
		const { telefono, otp } = datosPago;
		const telLimpio = String(telefono || "").replace(/\D/g, "");

		if (telLimpio.length !== 9) {
			return { aprobado: false, motivo: "El numero debe tener 9 digitos", telefono: telLimpio };
		}
		if (telLimpio.startsWith("000")) {
			return { aprobado: false, motivo: "Numero de billetera invalido", telefono: telLimpio };
		}

		const otpLimpio = String(otp || "").replace(/\D/g, "");
		if (otpLimpio.length !== 6) {
			return { aprobado: false, motivo: "Codigo OTP invalido (debe tener 6 digitos)", telefono: telLimpio };
		}

		const prefix = metodoPago.codigo === "yape" ? "YP" : "PL";
		return {
			aprobado: true,
			telefono: telLimpio,
			codigo_autorizacion: generarCodigoAutorizacion(),
			referencia_externa: generarReferenciaExterna(prefix),
		};
	}

	if (metodoPago.tipo === "transferencia") {
		return {
			aprobado: true,
			codigo_autorizacion: generarCodigoAutorizacion(),
			referencia_externa: generarReferenciaExterna("TR"),
		};
	}

	return { aprobado: false, motivo: "Tipo de metodo no soportado" };
}

// ─── API pública del servicio ────────────────────────────────────────────────
async function listarMetodosActivos() {
	const metodos = await pagoRepository.listMetodosActivos();
	return metodos.map((m) => ({
		id: m.id,
		codigo: m.codigo,
		nombre: m.nombre,
		tipo: m.tipo,
		requiere_tarjeta: m.requiere_tarjeta,
		comision_porcentaje: Number(m.comision_porcentaje),
		activo: m.activo,
	}));
}

/**
 * Procesa un intento de pago a través de la pasarela.
 * Si es aprobado, valida stock, crea pedido + detalle, descuenta inventario y limpia carrito.
 * Si es rechazado, deja registrada la transacción sin afectar el carrito ni el stock.
 */
async function procesarPago(usuarioId, payload) {
	const { metodo_pago_id, datos_pago = {}, fecha_pedido_cliente } = payload;

	if (!metodo_pago_id) {
		const error = new Error("metodo_pago_id es obligatorio");
		error.status = 400;
		throw error;
	}

	const metodoPago = await pagoRepository.findMetodoById(metodo_pago_id);
	if (!metodoPago || !metodoPago.activo) {
		const error = new Error("Metodo de pago no disponible");
		error.status = 400;
		throw error;
	}

	const carrito = await carritoRepository.getOrCreateByUserId(usuarioId);
	const items = await carritoRepository.getItems(carrito.id);

	if (!items.length) {
		const error = new Error("El carrito esta vacio");
		error.status = 400;
		throw error;
	}

	const resumen = buildResumen(items);

	// 1. Crear la transacción en estado 'procesando'
	const transaccion = await pagoRepository.createTransaccion({
		codigo_transaccion: generarCodigoTransaccion(),
		usuario_id: usuarioId,
		metodo_pago_id: metodoPago.id,
		pedido_id: null,
		monto: resumen.total,
		moneda: "PEN",
		estado: "procesando",
		tarjeta_titular: datos_pago.titular || null,
		fecha_iniciada: new Date(),
	});

	// 2. Ejecutar la simulación de la pasarela
	const resultado = simularPasarela(metodoPago, datos_pago);

	// 3. Si la pasarela rechazó, registrar el motivo y salir sin crear pedido
	if (!resultado.aprobado) {
		await pagoRepository.updateTransaccion(transaccion, {
			estado: "rechazada",
			tarjeta_ultimos_4: resultado.ultimos_4 || null,
			tarjeta_marca: resultado.marca || null,
			telefono_billetera: resultado.telefono || null,
			motivo_rechazo: resultado.motivo,
			fecha_procesada: new Date(),
			fecha_actualizacion: new Date(),
		});

		const error = new Error(resultado.motivo || "Pago rechazado por la pasarela");
		error.status = 402;
		error.transaccion = toTransaccionDTO(await pagoRepository.findTransaccionById(transaccion.id));
		throw error;
	}

	// 4. Si fue aprobada por la pasarela, validar stock y crear el pedido en una transacción atómica
	try {
		const pedidoCreadoId = await sequelize.transaction(async (t) => {
			for (const item of items) {
				if (Number(item.cantidad) > MAX_STOCK) {
					throw Object.assign(new Error("La cantidad maxima permitida por producto es 100"), { status: 400 });
				}
				const producto = await Producto.findByPk(item.producto_id, { transaction: t, lock: true });
				if (!producto || producto.stock < item.cantidad) {
					throw Object.assign(new Error(`Stock insuficiente para ${item.producto?.nombre || "producto"}`), { status: 400 });
				}
			}

			const pedido = await pedidoRepository.createPedido(
				{
					usuario_id: usuarioId,
					fecha_pedido: fecha_pedido_cliente ? new Date(fecha_pedido_cliente) : new Date(),
					estado: "pagado",
					total: resumen.total,
					metodo_pago_id: metodoPago.id,
				},
				{ transaction: t }
			);

			for (const item of items) {
				const subtotal = Number((Number(item.precio_unitario) * Number(item.cantidad)).toFixed(2));
				await pedidoRepository.createDetalle(
					{
						pedido_id: pedido.id,
						producto_id: item.producto_id,
						cantidad: item.cantidad,
						precio_unitario: item.precio_unitario,
						subtotal,
					},
					{ transaction: t }
				);
				await Producto.decrement("stock", {
					by: item.cantidad,
					where: { id: item.producto_id },
					transaction: t,
				});
			}

			await carritoRepository.clearCart(carrito.id, { transaction: t });
			return pedido.id;
		});

		// Marcar la transaccion como aprobada y vincularla al pedido
		await pagoRepository.updateTransaccion(transaccion, {
			estado: "aprobada",
			pedido_id: pedidoCreadoId,
			tarjeta_ultimos_4: resultado.ultimos_4 || null,
			tarjeta_marca: resultado.marca || null,
			telefono_billetera: resultado.telefono || null,
			codigo_autorizacion: resultado.codigo_autorizacion,
			referencia_externa: resultado.referencia_externa,
			fecha_procesada: new Date(),
			fecha_actualizacion: new Date(),
		});

		const pedidoCreado = await pedidoRepository.findById(pedidoCreadoId);
		const transaccionFinal = await pagoRepository.findTransaccionById(transaccion.id);

		return {
			transaccion: toTransaccionDTO(transaccionFinal),
			pedido: toPedidoDTO(pedidoCreado),
		};
	} catch (error) {
		// Si la creación del pedido falló (p. ej. stock), marcamos la transacción como rechazada
		await pagoRepository.updateTransaccion(transaccion, {
			estado: "rechazada",
			motivo_rechazo: error.message,
			fecha_procesada: new Date(),
			fecha_actualizacion: new Date(),
		});

		error.transaccion = toTransaccionDTO(await pagoRepository.findTransaccionById(transaccion.id));
		throw error;
	}
}

async function obtenerTransaccion(codigo, usuarioId, rol) {
	const transaccion = await pagoRepository.findTransaccionByCodigo(codigo);
	if (!transaccion) {
		const error = new Error("Transaccion no encontrada");
		error.status = 404;
		throw error;
	}
	if (rol === "cliente" && transaccion.usuario_id !== usuarioId) {
		const error = new Error("No autorizado");
		error.status = 403;
		throw error;
	}
	return toTransaccionDTO(transaccion);
}

async function listarMisTransacciones(usuarioId) {
	const transacciones = await pagoRepository.listTransaccionesByUsuario(usuarioId);
	return transacciones.map(toTransaccionDTO);
}

async function listarTodasTransacciones(filtros = {}) {
	const transacciones = await pagoRepository.listAllTransacciones(filtros);
	return transacciones.map(toTransaccionDTO);
}

module.exports = {
	listarMetodosActivos,
	procesarPago,
	obtenerTransaccion,
	listarMisTransacciones,
	listarTodasTransacciones,
};
