import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import Boton from "../components/common/Boton";
import { useCarrito } from "../hooks/useCarrito";
import pagoService from "../services/pagoService";
import { money } from "../utils/formateadores";

const ICONOS = {
	visa:          "VISA",
	mastercard:    "MC",
	amex:          "AMEX",
	yape:          "YAPE",
	plin:          "PLIN",
	transferencia: "BANCO",
};

function formatearNumeroTarjeta(valor) {
	const limpio = String(valor || "").replace(/\D/g, "").slice(0, 19);
	return limpio.replace(/(\d{4})(?=\d)/g, "$1 ").trim();
}

function formatearVencimiento(valor) {
	const limpio = String(valor || "").replace(/\D/g, "").slice(0, 4);
	if (limpio.length <= 2) return limpio;
	return `${limpio.slice(0, 2)}/${limpio.slice(2)}`;
}

export default function PasarelaPago() {
	const navigate = useNavigate();
	const { cart, refreshCart, showNotification } = useCarrito();

	const [metodos, setMetodos] = useState([]);
	const [metodoSeleccionado, setMetodoSeleccionado] = useState(null);
	const [datosPago, setDatosPago] = useState({});
	const [errores, setErrores] = useState({});
	const [procesando, setProcesando] = useState(false);
	const [resultado, setResultado] = useState(null); // { ok, transaccion, pedido?, mensaje }

	useEffect(() => {
		refreshCart();
		pagoService
			.getMetodos()
			.then((data) => {
				setMetodos(data);
				const visa = data.find((m) => m.codigo === "visa");
				setMetodoSeleccionado(visa || data[0] || null);
			})
			.catch(() => showNotification("No se pudo cargar la pasarela", "error"));
	}, []);

	const carritoVacio = !cart.items?.length;

	const total = useMemo(() => Number(cart.resumen?.total || 0), [cart]);
	const comisionEstimada = useMemo(() => {
		if (!metodoSeleccionado) return 0;
		return Number(((total * Number(metodoSeleccionado.comision_porcentaje || 0)) / 100).toFixed(2));
	}, [total, metodoSeleccionado]);

	const onChangeDato = (campo, valor) => {
		setDatosPago((prev) => ({ ...prev, [campo]: valor }));
		setErrores((prev) => ({ ...prev, [campo]: undefined }));
	};

	const validarFormulario = () => {
		const errs = {};
		if (!metodoSeleccionado) {
			errs.metodo = "Selecciona un método de pago";
			setErrores(errs);
			return false;
		}

		if (metodoSeleccionado.tipo === "tarjeta") {
			if (!datosPago.titular || datosPago.titular.trim().length < 3) {
				errs.titular = "Ingresa el nombre del titular (mín. 3 caracteres)";
			}
			const numero = String(datosPago.numero_tarjeta || "").replace(/\D/g, "");
			if (numero.length < 13 || numero.length > 19) {
				errs.numero_tarjeta = "Número de tarjeta inválido";
			}
			if (!/^\d{2}\/\d{2}$/.test(datosPago.vencimiento || "")) {
				errs.vencimiento = "Formato MM/YY";
			}
			const cvvLargo = metodoSeleccionado.codigo === "amex" ? 4 : 3;
			if (!new RegExp(`^\\d{${cvvLargo}}$`).test(datosPago.cvv || "")) {
				errs.cvv = `CVV de ${cvvLargo} dígitos`;
			}
		}

		if (metodoSeleccionado.tipo === "billetera") {
			const tel = String(datosPago.telefono || "").replace(/\D/g, "");
			if (tel.length !== 9) errs.telefono = "Debe tener 9 dígitos";
			if (!/^\d{6}$/.test(datosPago.otp || "")) errs.otp = "OTP de 6 dígitos";
		}

		setErrores(errs);
		return Object.keys(errs).length === 0;
	};

	const onPagar = async (e) => {
		e.preventDefault();
		if (!validarFormulario()) return;

		setProcesando(true);
		try {
			const respuesta = await pagoService.procesarPago({
				metodo_pago_id: metodoSeleccionado.id,
				datos_pago: datosPago,
				fecha_pedido_cliente: new Date().toISOString(),
			});

			setResultado({
				ok: true,
				transaccion: respuesta.transaccion,
				pedido: respuesta.pedido,
			});
			window.dispatchEvent(new Event("inventory:updated"));
			showNotification("¡Pago aprobado!");
			await refreshCart();
		} catch (error) {
			const data = error.response?.data;
			const mensaje = data?.message || error.message || "Error al procesar el pago";
			const transaccion = data?.data?.transaccion || null;
			setResultado({ ok: false, mensaje, transaccion });
			showNotification(mensaje, "error");
		} finally {
			setProcesando(false);
		}
	};

	const reintentar = () => {
		setResultado(null);
		setDatosPago({});
		setErrores({});
	};

	if (carritoVacio && !resultado) {
		return (
			<section className="mx-auto max-w-2xl rounded-2xl border border-slate-200 bg-white p-8 text-center shadow">
				<h2 className="mb-2 text-2xl font-bold text-slate-800">Tu carrito está vacío</h2>
				<p className="mb-6 text-slate-500">Agrega productos antes de proceder al pago.</p>
				<Boton className="bg-sky-700 hover:bg-sky-600" onClick={() => navigate("/productos")} type="button">
					Ir al catálogo
				</Boton>
			</section>
		);
	}

	// ─── Pantalla de resultado ────────────────────────────────────────────────
	if (resultado) {
		return (
			<section className="mx-auto max-w-2xl">
				<div
					className={`overflow-hidden rounded-2xl border-2 bg-white shadow-xl ${
						resultado.ok ? "border-emerald-200" : "border-rose-200"
					}`}
				>
					<div
						className={`px-6 py-8 text-center ${
							resultado.ok
								? "bg-gradient-to-br from-emerald-500 to-teal-600"
								: "bg-gradient-to-br from-rose-500 to-red-600"
						}`}
					>
						<div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-white/20">
							{resultado.ok ? (
								<svg className="h-10 w-10 text-white" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
									<path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
								</svg>
							) : (
								<svg className="h-10 w-10 text-white" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
									<path d="M6 18L18 6M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
								</svg>
							)}
						</div>
						<h2 className="text-2xl font-bold text-white">
							{resultado.ok ? "Pago aprobado" : "Pago rechazado"}
						</h2>
						<p className="mt-1 text-sm text-white/90">
							{resultado.ok
								? "Tu pedido se generó correctamente"
								: resultado.mensaje || "La pasarela rechazó la transacción"}
						</p>
					</div>

					<div className="space-y-4 px-6 py-6">
						{resultado.transaccion ? (
							<div className="rounded-xl bg-slate-50 p-4 text-sm">
								<p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">Detalle de la transacción</p>
								<dl className="grid grid-cols-2 gap-y-1.5">
									<dt className="text-slate-500">Código:</dt>
									<dd className="font-mono font-semibold text-slate-800">{resultado.transaccion.codigo_transaccion}</dd>
									<dt className="text-slate-500">Estado:</dt>
									<dd className="font-semibold uppercase">{resultado.transaccion.estado}</dd>
									<dt className="text-slate-500">Método:</dt>
									<dd>{resultado.transaccion.metodo_pago?.nombre || "—"}</dd>
									<dt className="text-slate-500">Monto:</dt>
									<dd className="font-bold">{money(resultado.transaccion.monto)}</dd>
									{resultado.transaccion.codigo_autorizacion && (
										<>
											<dt className="text-slate-500">Autorización:</dt>
											<dd className="font-mono">{resultado.transaccion.codigo_autorizacion}</dd>
										</>
									)}
									{resultado.transaccion.referencia_externa && (
										<>
											<dt className="text-slate-500">Referencia:</dt>
											<dd className="font-mono text-xs">{resultado.transaccion.referencia_externa}</dd>
										</>
									)}
									{resultado.transaccion.tarjeta?.ultimos_4 && (
										<>
											<dt className="text-slate-500">Tarjeta:</dt>
											<dd className="font-mono">**** {resultado.transaccion.tarjeta.ultimos_4}</dd>
										</>
									)}
									{resultado.transaccion.motivo_rechazo && (
										<>
											<dt className="text-slate-500">Motivo:</dt>
											<dd className="text-rose-700">{resultado.transaccion.motivo_rechazo}</dd>
										</>
									)}
								</dl>
							</div>
						) : null}

						{resultado.ok && resultado.pedido ? (
							<div className="rounded-xl border border-emerald-100 bg-emerald-50 p-4">
								<p className="mb-1 text-xs font-semibold uppercase text-emerald-700">Pedido generado</p>
								<p className="text-lg font-bold text-emerald-800">#{resultado.pedido.id}</p>
								<p className="text-sm text-emerald-700">Total: {money(resultado.pedido.total)}</p>
							</div>
						) : null}

						<div className="flex gap-2 pt-2">
							{resultado.ok ? (
								<>
									<Boton className="flex-1 bg-sky-700 hover:bg-sky-600" onClick={() => navigate("/mis-pedidos")} type="button">
										Ver mis pedidos
									</Boton>
									<Boton className="flex-1 bg-slate-200 text-slate-800 hover:bg-slate-300" onClick={() => navigate("/productos")} type="button">
										Seguir comprando
									</Boton>
								</>
							) : (
								<>
									<Boton className="flex-1 bg-sky-700 hover:bg-sky-600" onClick={reintentar} type="button">
										Reintentar pago
									</Boton>
									<Boton className="flex-1 bg-slate-200 text-slate-800 hover:bg-slate-300" onClick={() => navigate("/carrito")} type="button">
										Volver al carrito
									</Boton>
								</>
							)}
						</div>
					</div>
				</div>
			</section>
		);
	}

	// ─── Formulario de pago ───────────────────────────────────────────────────
	return (
		<section className="grid gap-6 lg:grid-cols-[1fr_360px]">
			<form className="space-y-6" onSubmit={onPagar}>
				<div>
					<h2 className="text-2xl font-bold text-slate-900">Pasarela de pago</h2>
					<p className="text-sm text-slate-500">Selecciona tu método de pago y completa los datos para finalizar la compra</p>
				</div>

				{/* Selector de método de pago */}
				<div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
					<p className="mb-3 text-sm font-semibold text-slate-700">Método de pago</p>
					<div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
						{metodos.map((m) => (
							<button
								className={`flex flex-col items-center gap-1 rounded-xl border-2 p-3 text-center transition ${
									metodoSeleccionado?.id === m.id
										? "border-sky-600 bg-sky-50 shadow"
										: "border-slate-200 bg-white hover:border-sky-300"
								}`}
								key={m.id}
								onClick={() => {
									setMetodoSeleccionado(m);
									setDatosPago({});
									setErrores({});
								}}
								type="button"
							>
								<span
									className={`rounded px-2 py-0.5 text-xs font-bold ${
										metodoSeleccionado?.id === m.id ? "bg-sky-600 text-white" : "bg-slate-100 text-slate-600"
									}`}
								>
									{ICONOS[m.codigo] || m.codigo.toUpperCase()}
								</span>
								<span className="text-sm font-semibold text-slate-800">{m.nombre}</span>
								<span className="text-[10px] uppercase tracking-wide text-slate-400">
									Comisión {Number(m.comision_porcentaje).toFixed(1)}%
								</span>
							</button>
						))}
					</div>
				</div>

				{/* Formulario dinámico según el método */}
				{metodoSeleccionado?.tipo === "tarjeta" && (
					<div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
						<p className="mb-4 text-sm font-semibold text-slate-700">Datos de la tarjeta</p>

						<label className="mb-3 block">
							<span className="mb-1 block text-xs font-semibold uppercase text-slate-500">Titular</span>
							<input
								className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm uppercase tracking-wide focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200"
								onChange={(e) => onChangeDato("titular", e.target.value.toUpperCase())}
								placeholder="NOMBRE COMPLETO"
								value={datosPago.titular || ""}
							/>
							{errores.titular && <span className="text-xs text-rose-600">{errores.titular}</span>}
						</label>

						<label className="mb-3 block">
							<span className="mb-1 block text-xs font-semibold uppercase text-slate-500">Número de tarjeta</span>
							<input
								className="w-full rounded-lg border border-slate-300 px-3 py-2 font-mono text-sm tracking-wider focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200"
								inputMode="numeric"
								onChange={(e) => onChangeDato("numero_tarjeta", formatearNumeroTarjeta(e.target.value))}
								placeholder="0000 0000 0000 0000"
								value={datosPago.numero_tarjeta || ""}
							/>
							{errores.numero_tarjeta && <span className="text-xs text-rose-600">{errores.numero_tarjeta}</span>}
						</label>

						<div className="grid grid-cols-2 gap-3">
							<label className="block">
								<span className="mb-1 block text-xs font-semibold uppercase text-slate-500">Vencimiento</span>
								<input
									className="w-full rounded-lg border border-slate-300 px-3 py-2 font-mono text-sm focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200"
									inputMode="numeric"
									maxLength={5}
									onChange={(e) => onChangeDato("vencimiento", formatearVencimiento(e.target.value))}
									placeholder="MM/YY"
									value={datosPago.vencimiento || ""}
								/>
								{errores.vencimiento && <span className="text-xs text-rose-600">{errores.vencimiento}</span>}
							</label>
							<label className="block">
								<span className="mb-1 block text-xs font-semibold uppercase text-slate-500">CVV</span>
								<input
									className="w-full rounded-lg border border-slate-300 px-3 py-2 font-mono text-sm focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200"
									inputMode="numeric"
									maxLength={4}
									onChange={(e) =>
										onChangeDato("cvv", String(e.target.value || "").replace(/\D/g, "").slice(0, 4))
									}
									placeholder="•••"
									type="password"
									value={datosPago.cvv || ""}
								/>
								{errores.cvv && <span className="text-xs text-rose-600">{errores.cvv}</span>}
							</label>
						</div>
					</div>
				)}

				{metodoSeleccionado?.tipo === "billetera" && (
					<div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
						<p className="mb-4 text-sm font-semibold text-slate-700">Datos de {metodoSeleccionado.nombre}</p>

						<label className="mb-3 block">
							<span className="mb-1 block text-xs font-semibold uppercase text-slate-500">Número de celular</span>
							<input
								className="w-full rounded-lg border border-slate-300 px-3 py-2 font-mono text-sm focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200"
								inputMode="numeric"
								maxLength={9}
								onChange={(e) =>
									onChangeDato("telefono", String(e.target.value || "").replace(/\D/g, "").slice(0, 9))
								}
								placeholder="999111222"
								value={datosPago.telefono || ""}
							/>
							{errores.telefono && <span className="text-xs text-rose-600">{errores.telefono}</span>}
						</label>

						<label className="block">
							<span className="mb-1 block text-xs font-semibold uppercase text-slate-500">Código OTP (6 dígitos)</span>
							<input
								className="w-full rounded-lg border border-slate-300 px-3 py-2 font-mono text-sm tracking-widest focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200"
								inputMode="numeric"
								maxLength={6}
								onChange={(e) =>
									onChangeDato("otp", String(e.target.value || "").replace(/\D/g, "").slice(0, 6))
								}
								placeholder="000000"
								value={datosPago.otp || ""}
							/>
							{errores.otp && <span className="text-xs text-rose-600">{errores.otp}</span>}
						</label>

						<p className="mt-3 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800">
							Para pruebas: usa cualquier número de 9 dígitos que no comience con &quot;000&quot; y un OTP de 6 dígitos.
						</p>
					</div>
				)}

				{metodoSeleccionado?.tipo === "transferencia" && (
					<div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
						<p className="text-sm text-slate-600">
							Se generará una orden de transferencia bancaria con los datos de tu pedido. Confirma para continuar.
						</p>
					</div>
				)}

				<Boton
					className="w-full bg-emerald-700 py-3 text-base font-bold hover:bg-emerald-600 disabled:opacity-50"
					disabled={!metodoSeleccionado || procesando}
					type="submit"
				>
					{procesando ? "Procesando pago..." : `Pagar ${money(total)}`}
				</Boton>
			</form>

			{/* Resumen lateral */}
			<aside className="space-y-3">
				<div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
					<h3 className="mb-3 text-base font-bold">Resumen de tu compra</h3>
					<div className="space-y-2 text-sm">
						{cart.items?.map((item) => (
							<div className="flex justify-between gap-2 border-b border-slate-100 pb-1 last:border-0" key={item.id}>
								<span className="truncate text-slate-700">
									{item.nombre} <span className="text-slate-400">×{item.cantidad}</span>
								</span>
								<span className="shrink-0 font-semibold">{money(item.subtotal)}</span>
							</div>
						))}
					</div>
				</div>

				<div className="rounded-2xl border border-sky-100 bg-gradient-to-br from-sky-50 to-indigo-50 p-5 shadow-sm">
					<div className="space-y-1.5 text-sm">
						<p className="flex justify-between text-slate-600">
							<span>Subtotal</span>
							<span>{money(cart.resumen?.subtotal)}</span>
						</p>
						<p className="flex justify-between text-slate-600">
							<span>Impuestos</span>
							<span>{money(cart.resumen?.impuestos)}</span>
						</p>
						{metodoSeleccionado && comisionEstimada > 0 ? (
							<p className="flex justify-between text-slate-500">
								<span>
									Comisión pasarela ({Number(metodoSeleccionado.comision_porcentaje).toFixed(1)}%)
								</span>
								<span>{money(comisionEstimada)}</span>
							</p>
						) : null}
						<p className="mt-2 flex justify-between border-t border-sky-200 pt-2 text-lg font-bold">
							<span>Total a pagar</span>
							<span className="text-sky-700">{money(total)}</span>
						</p>
					</div>
				</div>

				<div className="rounded-xl bg-slate-50 p-3 text-xs text-slate-500">
					<p className="font-semibold text-slate-700">Pago seguro</p>
					<p>Tus datos de tarjeta se enmascaran y nunca se almacenan completos.</p>
				</div>
			</aside>
		</section>
	);
}
