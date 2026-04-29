import { useEffect, useMemo, useState } from "react";

import Modal from "../components/common/Modal";
import api from "../services/api";
import { dateTimeFormat, money } from "../utils/formateadores";

const ESTADO_BADGE = {
	pendiente:  { label: "Pendiente",  bg: "bg-amber-100 text-amber-800 border-amber-200" },
	pagado:     { label: "Pagado",     bg: "bg-sky-100 text-sky-800 border-sky-200" },
	enviado:    { label: "Enviado",    bg: "bg-indigo-100 text-indigo-800 border-indigo-200" },
	entregado:  { label: "Entregado",  bg: "bg-emerald-100 text-emerald-800 border-emerald-200" },
	cancelado:  { label: "Cancelado",  bg: "bg-rose-100 text-rose-800 border-rose-200" },
};

function EstadoBadge({ estado }) {
	const cfg = ESTADO_BADGE[estado] || { label: estado, bg: "bg-slate-100 text-slate-700 border-slate-200" };
	return (
		<span className={`inline-block rounded-full border px-2.5 py-0.5 text-xs font-semibold ${cfg.bg}`}>
			{cfg.label}
		</span>
	);
}

export default function GestionPedidos() {
	const [pedidos, setPedidos] = useState([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");
	const [selectedPedido, setSelectedPedido] = useState(null);
	const [openModal, setOpenModal] = useState(false);
	const [updatingId, setUpdatingId] = useState(null);

	const [filters, setFilters] = useState({
		fechaDesde: "",
		fechaHasta: "",
		clienteId: "",
	});

	const fetchPedidos = async (params = {}) => {
		setLoading(true);
		setError("");
		try {
			const query = {};
			if (params.fechaDesde) query.fechaDesde = params.fechaDesde;
			if (params.fechaHasta) query.fechaHasta = params.fechaHasta;
			if (params.clienteId) query.usuarioId = params.clienteId;
			const { data } = await api.get("/pedidos", { params: query });
			setPedidos(data.data || []);
		} catch {
			setError("No se pudieron cargar los pedidos.");
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchPedidos();
	}, []);

	const clientes = useMemo(() => {
		const map = new Map();
		pedidos.forEach((p) => {
			if (p.cliente && !map.has(p.cliente.id)) {
				map.set(p.cliente.id, p.cliente);
			}
		});
		return Array.from(map.values()).sort((a, b) => a.nombre.localeCompare(b.nombre));
	}, [pedidos]);

	const onApplyFilters = (e) => {
		e.preventDefault();
		fetchPedidos(filters);
	};

	const onClearFilters = () => {
		const reset = { fechaDesde: "", fechaHasta: "", clienteId: "" };
		setFilters(reset);
		fetchPedidos(reset);
	};

	const openDetails = (pedido) => {
		setSelectedPedido(pedido);
		setOpenModal(true);
	};

	const onChangeEstado = async (pedidoId, nuevoEstado) => {
		setUpdatingId(pedidoId);
		try {
			await api.patch(`/pedidos/${pedidoId}/estado`, { estado: nuevoEstado });
			setPedidos((prev) =>
				prev.map((p) => (p.id === pedidoId ? { ...p, estado: nuevoEstado } : p))
			);
			if (selectedPedido?.id === pedidoId) {
				setSelectedPedido((prev) => ({ ...prev, estado: nuevoEstado }));
			}
		} catch {
			setError("No se pudo actualizar el estado.");
		} finally {
			setUpdatingId(null);
		}
	};

	const subtotalPedido = useMemo(() => {
		if (!selectedPedido?.detalles?.length) return 0;
		return selectedPedido.detalles.reduce((acc, d) => acc + Number(d.subtotal || 0), 0);
	}, [selectedPedido]);

	return (
		<section className="space-y-5">
			<div className="flex items-center justify-between">
				<div>
					<h2 className="text-2xl font-bold text-slate-900">Gestión de pedidos</h2>
					<p className="text-sm text-slate-500">Visualiza y gestiona todos los pedidos de clientes</p>
				</div>
				<span className="rounded-full bg-sky-100 px-3 py-1 text-sm font-semibold text-sky-700">
					{pedidos.length} pedido{pedidos.length !== 1 ? "s" : ""}
				</span>
			</div>

			{/* Filtros */}
			<form
				className="rounded-xl border border-sky-100 bg-gradient-to-br from-white to-sky-50 p-4 shadow"
				onSubmit={onApplyFilters}
			>
				<p className="mb-3 text-sm font-semibold text-slate-700">Filtros</p>
				<div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
					<label className="block text-sm font-medium text-slate-700">
						Desde
						<input
							className="mt-1 w-full rounded-lg border border-sky-200 bg-white px-3 py-2 text-sm"
							onChange={(e) => setFilters((f) => ({ ...f, fechaDesde: e.target.value }))}
							type="date"
							value={filters.fechaDesde}
						/>
					</label>
					<label className="block text-sm font-medium text-slate-700">
						Hasta
						<input
							className="mt-1 w-full rounded-lg border border-sky-200 bg-white px-3 py-2 text-sm"
							onChange={(e) => setFilters((f) => ({ ...f, fechaHasta: e.target.value }))}
							type="date"
							value={filters.fechaHasta}
						/>
					</label>
					<label className="block text-sm font-medium text-slate-700">
						Cliente
						<select
							className="mt-1 w-full rounded-lg border border-sky-200 bg-white px-3 py-2 text-sm"
							onChange={(e) => setFilters((f) => ({ ...f, clienteId: e.target.value }))}
							value={filters.clienteId}
						>
							<option value="">Todos los clientes</option>
							{clientes.map((c) => (
								<option key={c.id} value={c.id}>
									{c.nombre}
								</option>
							))}
						</select>
					</label>
					<div className="flex items-end gap-2">
						<button
							className="flex-1 rounded-lg bg-sky-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-sky-600"
							type="submit"
						>
							Buscar
						</button>
						<button
							className="flex-1 rounded-lg bg-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-300"
							onClick={onClearFilters}
							type="button"
						>
							Limpiar
						</button>
					</div>
				</div>
			</form>

			{error ? <p className="rounded-lg bg-rose-50 px-4 py-2 text-sm text-rose-700">{error}</p> : null}

			{loading ? (
				<div className="flex justify-center py-12">
					<div className="h-8 w-8 animate-spin rounded-full border-4 border-sky-200 border-t-sky-600" />
				</div>
			) : !pedidos.length ? (
				<div className="rounded-xl border border-slate-200 bg-white py-16 text-center shadow">
					<p className="text-slate-500">No se encontraron pedidos con los filtros aplicados.</p>
				</div>
			) : (
				<div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow">
					<table className="min-w-full text-sm">
						<thead>
							<tr className="border-b border-slate-100 bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
								<th className="px-4 py-3">#</th>
								<th className="px-4 py-3">Cliente</th>
								<th className="px-4 py-3">Fecha</th>
								<th className="px-4 py-3">Estado</th>
								<th className="px-4 py-3">Método pago</th>
								<th className="px-4 py-3 text-right">Total</th>
								<th className="px-4 py-3 text-center">Acciones</th>
							</tr>
						</thead>
						<tbody className="divide-y divide-slate-100">
							{pedidos.map((pedido) => (
								<tr className="transition hover:bg-sky-50/40" key={pedido.id}>
									<td className="px-4 py-3 font-semibold text-slate-700">#{pedido.id}</td>
									<td className="px-4 py-3">
										<p className="font-medium text-slate-800">
											{pedido.cliente?.nombre || `Usuario #${pedido.usuario_id}`}
										</p>
										{pedido.cliente?.correo_electronico ? (
											<p className="text-xs text-slate-400">{pedido.cliente.correo_electronico}</p>
										) : null}
									</td>
									<td className="px-4 py-3 text-slate-600">
										{dateTimeFormat(pedido.fecha_pedido)}
									</td>
									<td className="px-4 py-3">
										<EstadoBadge estado={pedido.estado} />
									</td>
									<td className="px-4 py-3 text-slate-600">
										<p className="font-medium text-slate-700">
											{pedido.metodo_pago?.nombre || "—"}
										</p>
										{pedido.transaccion_pago?.tarjeta_ultimos_4 ? (
											<p className="font-mono text-xs text-slate-400">
												**** {pedido.transaccion_pago.tarjeta_ultimos_4}
											</p>
										) : null}
										{pedido.transaccion_pago?.telefono_billetera ? (
											<p className="font-mono text-xs text-slate-400">
												{pedido.transaccion_pago.telefono_billetera}
											</p>
										) : null}
									</td>
									<td className="px-4 py-3 text-right font-semibold text-slate-800">
										{money(pedido.total)}
									</td>
									<td className="px-4 py-3">
										<div className="flex justify-center gap-2">
											<button
												className="rounded-lg bg-sky-600 px-3 py-1 text-xs font-semibold text-white transition hover:bg-sky-500"
												onClick={() => openDetails(pedido)}
												type="button"
											>
												Ver
											</button>
											<select
												className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs text-slate-700 transition hover:border-sky-300 disabled:opacity-50"
												disabled={updatingId === pedido.id}
												onChange={(e) => onChangeEstado(pedido.id, e.target.value)}
												value={pedido.estado}
											>
												{Object.keys(ESTADO_BADGE).map((est) => (
													<option key={est} value={est}>
														{ESTADO_BADGE[est].label}
													</option>
												))}
											</select>
										</div>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			)}

			{/* Modal de detalle */}
			<Modal
				onClose={() => setOpenModal(false)}
				open={openModal}
				title={selectedPedido ? `Pedido #${selectedPedido.id}` : "Detalle del pedido"}
			>
				{selectedPedido ? (
					<div className="space-y-4">
						<div className="grid grid-cols-2 gap-2 rounded-lg bg-slate-50 p-3 text-sm">
							<div>
								<p className="text-xs font-semibold uppercase text-slate-400">Cliente</p>
								<p className="font-medium">{selectedPedido.cliente?.nombre || `#${selectedPedido.usuario_id}`}</p>
								{selectedPedido.cliente?.correo_electronico ? (
									<p className="text-xs text-slate-500">{selectedPedido.cliente.correo_electronico}</p>
								) : null}
							</div>
							<div>
								<p className="text-xs font-semibold uppercase text-slate-400">Fecha</p>
								<p>{dateTimeFormat(selectedPedido.fecha_pedido)}</p>
							</div>
							<div>
								<p className="text-xs font-semibold uppercase text-slate-400">Estado</p>
								<EstadoBadge estado={selectedPedido.estado} />
							</div>
							<div>
								<p className="text-xs font-semibold uppercase text-slate-400">Pago</p>
								<p>{selectedPedido.metodo_pago?.nombre || "N/A"}</p>
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
							{selectedPedido.transaccion_pago?.codigo_transaccion ? (
								<div className="col-span-2">
									<p className="text-xs font-semibold uppercase text-slate-400">Transacción</p>
									<p className="font-mono text-xs text-slate-700">
										{selectedPedido.transaccion_pago.codigo_transaccion}
										{selectedPedido.transaccion_pago.codigo_autorizacion
											? ` · Auth ${selectedPedido.transaccion_pago.codigo_autorizacion}`
											: ""}
									</p>
								</div>
							) : null}
						</div>

						<div className="space-y-2">
							<p className="text-xs font-semibold uppercase text-slate-500">Productos</p>
							{selectedPedido.detalles?.map((item) => (
								<div className="flex items-center justify-between rounded-lg border border-slate-100 bg-white p-3" key={item.id}>
									<div>
										<p className="font-semibold text-slate-800">{item.nombre_producto}</p>
										<p className="text-xs text-slate-500">
											{item.cantidad} × {money(item.precio_unitario)}
										</p>
									</div>
									<p className="font-semibold text-slate-700">{money(item.subtotal)}</p>
								</div>
							))}
						</div>

						<div className="rounded-lg border border-sky-100 bg-sky-50 p-3 text-sm">
							<p className="flex justify-between">
								<span className="text-slate-600">Subtotal</span>
								<span>{money(subtotalPedido)}</span>
							</p>
							<p className="flex justify-between">
								<span className="text-slate-600">Impuestos</span>
								<span>{money(Number((selectedPedido.total - subtotalPedido).toFixed(2)))}</span>
							</p>
							<p className="mt-1 flex justify-between border-t border-sky-200 pt-1 font-bold">
								<span>Total</span>
								<span>{money(selectedPedido.total)}</span>
							</p>
						</div>
					</div>
				) : null}
			</Modal>
		</section>
	);
}
