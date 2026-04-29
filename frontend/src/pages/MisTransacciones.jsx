import { useEffect, useState } from "react";

import pagoService from "../services/pagoService";
import { dateTimeFormat, money } from "../utils/formateadores";

const ESTADO_CONFIG = {
	iniciada:    { label: "Iniciada",    classes: "bg-slate-100 text-slate-700 border-slate-200" },
	procesando:  { label: "Procesando",  classes: "bg-amber-100 text-amber-800 border-amber-200" },
	aprobada:    { label: "Aprobada",    classes: "bg-emerald-100 text-emerald-800 border-emerald-200" },
	rechazada:   { label: "Rechazada",   classes: "bg-rose-100 text-rose-800 border-rose-200" },
	reembolsada: { label: "Reembolsada", classes: "bg-indigo-100 text-indigo-800 border-indigo-200" },
};

function EstadoBadge({ estado }) {
	const cfg = ESTADO_CONFIG[estado] || { label: estado, classes: "bg-slate-100 text-slate-700 border-slate-200" };
	return (
		<span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${cfg.classes}`}>
			{cfg.label}
		</span>
	);
}

export default function MisTransacciones() {
	const [transacciones, setTransacciones] = useState([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		pagoService
			.getMisTransacciones()
			.then((data) => {
				setTransacciones(data);
				setLoading(false);
			})
			.catch(() => setLoading(false));
	}, []);

	return (
		<section className="space-y-4">
			<div className="flex items-center justify-between">
				<div>
					<h2 className="text-2xl font-bold text-slate-900">Mis transacciones</h2>
					<p className="text-sm text-slate-500">Historial de pagos procesados por la pasarela</p>
				</div>
				{transacciones.length > 0 && (
					<span className="rounded-full bg-sky-100 px-3 py-1 text-sm font-semibold text-sky-700">
						{transacciones.length}
					</span>
				)}
			</div>

			{loading ? (
				<div className="flex justify-center py-16">
					<div className="h-8 w-8 animate-spin rounded-full border-4 border-sky-200 border-t-sky-600" />
				</div>
			) : !transacciones.length ? (
				<div className="rounded-xl border border-slate-200 bg-white py-16 text-center text-slate-500 shadow">
					Aún no tienes transacciones registradas.
				</div>
			) : (
				<div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow">
					<table className="min-w-full text-sm">
						<thead>
							<tr className="border-b border-slate-100 bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
								<th className="px-4 py-3">Código</th>
								<th className="px-4 py-3">Fecha</th>
								<th className="px-4 py-3">Método</th>
								<th className="px-4 py-3">Estado</th>
								<th className="px-4 py-3 text-right">Monto</th>
								<th className="px-4 py-3">Detalle</th>
							</tr>
						</thead>
						<tbody className="divide-y divide-slate-100">
							{transacciones.map((tx) => (
								<tr className="transition hover:bg-sky-50/40" key={tx.id}>
									<td className="px-4 py-3 font-mono text-xs font-semibold text-slate-700">
										{tx.codigo_transaccion}
									</td>
									<td className="px-4 py-3 text-slate-600">{dateTimeFormat(tx.fecha_iniciada)}</td>
									<td className="px-4 py-3">
										<p className="font-medium">{tx.metodo_pago?.nombre || "—"}</p>
										{tx.tarjeta?.ultimos_4 ? (
											<p className="font-mono text-xs text-slate-400">
												{tx.tarjeta.marca?.toUpperCase()} **** {tx.tarjeta.ultimos_4}
											</p>
										) : null}
										{tx.telefono_billetera ? (
											<p className="font-mono text-xs text-slate-400">{tx.telefono_billetera}</p>
										) : null}
									</td>
									<td className="px-4 py-3">
										<EstadoBadge estado={tx.estado} />
									</td>
									<td className="px-4 py-3 text-right font-semibold">{money(tx.monto)}</td>
									<td className="px-4 py-3 text-xs">
										{tx.codigo_autorizacion ? (
											<p>
												<span className="text-slate-400">Auth: </span>
												<span className="font-mono">{tx.codigo_autorizacion}</span>
											</p>
										) : null}
										{tx.pedido_id ? (
											<p>
												<span className="text-slate-400">Pedido: </span>
												<span className="font-semibold">#{tx.pedido_id}</span>
											</p>
										) : null}
										{tx.motivo_rechazo ? (
											<p className="text-rose-700">{tx.motivo_rechazo}</p>
										) : null}
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			)}
		</section>
	);
}
