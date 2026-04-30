import { useEffect, useMemo, useState } from "react";

import Modal from "../components/common/Modal";
import carritoService from "../services/carritoService";
import { dateTimeFormat, money } from "../utils/formateadores";

const localProductImages = {
	...import.meta.glob("../assets/*", { eager: true, import: "default" }),
	...import.meta.glob("../assets/productos/*", { eager: true, import: "default" }),
};

function resolveProductImage(imagenUrl) {
	if (!imagenUrl) return null;
	if (imagenUrl.startsWith("http://") || imagenUrl.startsWith("https://")) {
		return imagenUrl;
	}
	if (imagenUrl.startsWith("/uploads/")) {
		const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:4000/api";
		return `${baseUrl.replace(/\/api\/?$/, "")}${imagenUrl}`;
	}
	const normalized = imagenUrl.replaceAll("\\", "/");
	const fileName = normalized.split("/").pop();
	if (!fileName) return null;
	const directAsset = localProductImages[`../assets/${fileName}`];
	if (directAsset) return directAsset;

	const legacyAsset = localProductImages[`../assets/productos/${fileName}`];
	if (legacyAsset) return legacyAsset;

	// Fallback paths: el navegador intentará cargarlas y verás 404 en Network si faltan
	const tryPaths = [
		`/assets/productos/${fileName}`,
		`/src/assets/productos/${fileName}`,
		`/src/assets/${fileName}`,
	];
	return tryPaths[0];
}

const ESTADO_CONFIG = {
	pendiente:  { label: "Pendiente",  classes: "bg-amber-100 text-amber-800 border-amber-200" },
	pagado:     { label: "Pagado",     classes: "bg-sky-100 text-sky-800 border-sky-200" },
	enviado:    { label: "Enviado",    classes: "bg-indigo-100 text-indigo-800 border-indigo-200" },
	entregado:  { label: "Entregado",  classes: "bg-emerald-100 text-emerald-800 border-emerald-200" },
	cancelado:  { label: "Cancelado",  classes: "bg-rose-100 text-rose-800 border-rose-200" },
};

function EstadoBadge({ estado }) {
	const cfg = ESTADO_CONFIG[estado] || { label: estado, classes: "bg-slate-100 text-slate-700 border-slate-200" };
	return (
		<span className={`inline-flex items-center rounded-full border px-3 py-0.5 text-xs font-semibold ${cfg.classes}`}>
			{cfg.label}
		</span>
	);
}

function metodoPagoLabel(pedido) {
	if (pedido?.metodo_pago?.nombre) return pedido.metodo_pago.nombre;
	return "—";
}

export default function MisPedidos() {
	const [pedidos, setPedidos] = useState([]);
	const [loading, setLoading] = useState(true);
	const [selectedPedido, setSelectedPedido] = useState(null);
	const [openModal, setOpenModal] = useState(false);

	const subtotalPedido = useMemo(() => {
		if (!selectedPedido?.detalles?.length) return 0;
		return selectedPedido.detalles.reduce((acc, item) => acc + Number(item.subtotal || 0), 0);
	}, [selectedPedido]);

	const impuestosPedido = useMemo(() => {
		if (!selectedPedido) return 0;
		return Number((Number(selectedPedido.total || 0) - subtotalPedido).toFixed(2));
	}, [selectedPedido, subtotalPedido]);

	useEffect(() => {
		carritoService.getMisPedidos().then((data) => {
			setPedidos(data);
			setLoading(false);
		});
	}, []);

	const openDetails = (pedido) => {
		setSelectedPedido(pedido);
		setOpenModal(true);
	};

	return (
		<section className="space-y-4">
			<div className="flex items-center justify-between">
				<div>
					<h2 className="text-2xl font-bold text-slate-900">Mis pedidos</h2>
					<p className="text-sm text-slate-500">Historial completo de tus compras</p>
				</div>
				{pedidos.length > 0 && (
					<span className="rounded-full bg-sky-100 px-3 py-1 text-sm font-semibold text-sky-700">
						{pedidos.length} pedido{pedidos.length !== 1 ? "s" : ""}
					</span>
				)}
			</div>

			{loading ? (
				<div className="flex justify-center py-16">
					<div className="h-8 w-8 animate-spin rounded-full border-4 border-sky-200 border-t-sky-600" />
				</div>
			) : !pedidos.length ? (
				<div className="flex flex-col items-center justify-center rounded-xl border border-slate-200 bg-white py-20 shadow">
					<svg className="mb-4 h-14 w-14 text-slate-300" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
						<path d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" strokeLinecap="round" strokeLinejoin="round" />
					</svg>
					<p className="text-lg font-semibold text-slate-500">Aún no tienes pedidos</p>
					<p className="text-sm text-slate-400">Tus compras aparecerán aquí una vez que finalices una.</p>
				</div>
			) : (
				<div className="space-y-3">
					{pedidos.map((pedido) => {
						const imgPrimaria = pedido.detalles?.[0]?.imagen_url
							? resolveProductImage(pedido.detalles[0].imagen_url)
							: null;

						return (
							<article
								className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-md transition hover:-translate-y-0.5 hover:shadow-lg"
								key={pedido.id}
							>
								<div className="flex items-stretch">
									{/* Miniatura del primer producto */}
									<div className="hidden w-24 shrink-0 items-center justify-center overflow-hidden bg-slate-50 sm:flex">
										{imgPrimaria ? (
											<img
												alt={pedido.detalles[0].nombre_producto}
												className="h-full w-full object-contain p-2"
												src={imgPrimaria}
											/>
										) : (
											<div className="flex h-full w-full items-center justify-center">
												<svg className="h-8 w-8 text-slate-300" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
													<path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14M14 8h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" strokeLinecap="round" strokeLinejoin="round" />
												</svg>
											</div>
										)}
									</div>

									{/* Contenido del pedido */}
									<div className="flex flex-1 flex-col gap-2 p-4">
										<div className="flex flex-wrap items-center justify-between gap-2">
											<div className="flex items-center gap-2">
												<span className="text-base font-bold text-slate-800">Pedido #{pedido.id}</span>
												<EstadoBadge estado={pedido.estado} />
											</div>
											<span className="text-sm text-slate-500">{dateTimeFormat(pedido.fecha_pedido)}</span>
										</div>

										{/* Resumen de productos */}
										<p className="text-sm text-slate-500">
											{pedido.detalles?.length
												? pedido.detalles.map((d) => `${d.nombre_producto} ×${d.cantidad}`).join("  ·  ")
												: "Sin productos"}
										</p>

										<div className="flex flex-wrap items-center justify-between gap-2">
											<div className="flex items-center gap-3 text-sm text-slate-500">
												<span>{metodoPagoLabel(pedido)}</span>
												{pedido.transaccion_pago?.tarjeta_ultimos_4 ? (
													<span className="font-mono text-xs text-slate-400">
														**** {pedido.transaccion_pago.tarjeta_ultimos_4}
													</span>
												) : null}
												<span className="text-slate-300">|</span>
												<span>{pedido.detalles?.length || 0} producto{pedido.detalles?.length !== 1 ? "s" : ""}</span>
											</div>
											<span className="text-lg font-bold text-slate-800">{money(pedido.total)}</span>
										</div>

										<button
											className="mt-1 self-start rounded-lg bg-gradient-to-r from-sky-600 to-indigo-600 px-4 py-1.5 text-sm font-semibold text-white transition hover:from-sky-500 hover:to-indigo-500"
											onClick={() => openDetails(pedido)}
											type="button"
										>
											Ver detalle completo
										</button>
									</div>
								</div>
							</article>
						);
					})}
				</div>
			)}

			{/* Modal de detalle completo */}
			<Modal
				onClose={() => setOpenModal(false)}
				open={openModal}
				title={selectedPedido ? `Pedido #${selectedPedido.id}` : "Detalle del pedido"}
			>
				{selectedPedido ? (
					<div className="space-y-5">
						{/* Info general del pedido */}
						<div className="grid grid-cols-2 gap-3 rounded-xl bg-slate-50 p-4 text-sm">
							<div>
								<p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Fecha y hora</p>
								<p className="mt-0.5 font-medium text-slate-800">{dateTimeFormat(selectedPedido.fecha_pedido)}</p>
							</div>
							<div>
								<p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Estado</p>
								<div className="mt-1">
									<EstadoBadge estado={selectedPedido.estado} />
								</div>
							</div>
							<div>
								<p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Método de pago</p>
								<p className="mt-0.5 font-medium text-slate-800">
									{metodoPagoLabel(selectedPedido)}
								</p>
								{selectedPedido.transaccion_pago?.tarjeta_ultimos_4 ? (
									<p className="font-mono text-xs text-slate-500">
										{(selectedPedido.transaccion_pago.tarjeta_marca || "").toUpperCase()} **** {selectedPedido.transaccion_pago.tarjeta_ultimos_4}
									</p>
								) : null}
								{selectedPedido.transaccion_pago?.telefono_billetera ? (
									<p className="font-mono text-xs text-slate-500">
										{selectedPedido.transaccion_pago.telefono_billetera}
									</p>
								) : null}
							</div>
							<div>
								<p className="text-xs font-semibold uppercase tracking-wide text-slate-400">N.° de productos</p>
								<p className="mt-0.5 font-medium text-slate-800">{selectedPedido.detalles?.length || 0}</p>
							</div>
							{selectedPedido.transaccion_pago?.codigo_transaccion ? (
								<div className="col-span-2">
									<p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Transacción</p>
									<p className="mt-0.5 font-mono text-xs text-slate-700">
										{selectedPedido.transaccion_pago.codigo_transaccion}
										{selectedPedido.transaccion_pago.codigo_autorizacion
											? ` · Auth ${selectedPedido.transaccion_pago.codigo_autorizacion}`
											: ""}
									</p>
								</div>
							) : null}
						</div>

						{/* Lista de productos con imágenes */}
						<div>
							<p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Productos comprados</p>
							<div className="space-y-3">
								{selectedPedido.detalles?.map((item) => {
									const imgSrc = resolveProductImage(item.imagen_url);
									return (
										<div
											className="flex items-center gap-3 rounded-xl border border-slate-100 bg-white p-3 shadow-sm"
											key={item.id}
										>
											{/* Imagen del producto */}
											<div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-slate-50 border border-slate-100">
												{imgSrc ? (
													<img
														alt={item.nombre_producto}
														className="h-full w-full object-contain p-1"
														src={imgSrc}
													/>
												) : (
													<svg className="h-7 w-7 text-slate-300" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
														<path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14M14 8h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" strokeLinecap="round" strokeLinejoin="round" />
													</svg>
												)}
											</div>

											{/* Datos del producto */}
											<div className="min-w-0 flex-1">
												<p className="truncate font-semibold text-slate-800">{item.nombre_producto || "Producto"}</p>
												{item.categoria && (
													<p className="text-xs uppercase tracking-wide text-slate-400">{item.categoria}</p>
												)}
												<div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-slate-500">
													<span>Cant.: <strong className="text-slate-700">{item.cantidad}</strong></span>
													<span>P. unit.: <strong className="text-slate-700">{money(item.precio_unitario)}</strong></span>
												</div>
											</div>

											{/* Subtotal */}
											<div className="shrink-0 text-right">
												<p className="text-xs text-slate-400">Subtotal</p>
												<p className="font-bold text-slate-800">{money(item.subtotal)}</p>
											</div>
										</div>
									);
								})}
							</div>
						</div>

						{/* Resumen de totales */}
						<div className="rounded-xl border border-sky-100 bg-gradient-to-br from-sky-50 to-indigo-50 p-4 text-sm">
							<p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Resumen del pago</p>
							<div className="space-y-1.5">
								<div className="flex justify-between text-slate-600">
									<span>Subtotal</span>
									<span>{money(subtotalPedido)}</span>
								</div>
								<div className="flex justify-between text-slate-600">
									<span>Impuestos / cargos</span>
									<span>{money(impuestosPedido)}</span>
								</div>
								<div className="mt-2 flex justify-between border-t border-sky-200 pt-2 font-bold text-slate-900">
									<span>Total pagado</span>
									<span className="text-sky-700">{money(selectedPedido.total)}</span>
								</div>
							</div>
						</div>
					</div>
				) : null}
			</Modal>
		</section>
	);
}
