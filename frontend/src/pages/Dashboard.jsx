import { useEffect, useState } from "react";
import {
	Bar,
	BarChart,
	CartesianGrid,
	Legend,
	Line,
	LineChart,
	Pie,
	PieChart,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from "recharts";

import carritoService from "../services/carritoService";
import { money } from "../utils/formateadores";

export default function Dashboard() {
	const [kpis, setKpis] = useState(null);
	const [ventasDiarias, setVentasDiarias] = useState([]);
	const [categorias, setCategorias] = useState([]);
	const [stats, setStats] = useState(null);

	useEffect(() => {
		Promise.all([
			carritoService.getDashboardKpis(),
			carritoService.getVentasDiarias(),
			carritoService.getCategorias(),
			carritoService.getEstadisticas(),
		]).then(([k, vd, c, s]) => {
			setKpis(k);
			setVentasDiarias(vd);
			setCategorias(c);
			setStats(s);
		});
	}, []);

	return (
		<section className="space-y-5 rounded-2xl bg-gradient-to-br from-cyan-50 via-white to-amber-50 p-4 md:p-6">
			<h2 className="text-2xl font-bold">Dashboard comercial</h2>

			<div className="grid gap-3 md:grid-cols-3">
				<article className="rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 p-4 text-white shadow-lg">
					<p className="text-sm text-emerald-100">Ventas de hoy</p>
					<p className="text-2xl font-extrabold">{money(kpis?.ventas_hoy)}</p>
				</article>
				<article className="rounded-xl bg-gradient-to-r from-sky-500 to-indigo-500 p-4 text-white shadow-lg">
					<p className="text-sm text-sky-100">Ingresos totales</p>
					<p className="text-2xl font-extrabold">{money(kpis?.ingresos_totales)}</p>
				</article>
				<article className="rounded-xl bg-gradient-to-r from-fuchsia-500 to-rose-500 p-4 text-white shadow-lg">
					<p className="text-sm text-fuchsia-100">Pedidos</p>
					<p className="text-2xl font-extrabold">{kpis?.total_pedidos || 0}</p>
				</article>
			</div>

			<div className="grid gap-4 lg:grid-cols-2">
				<div className="h-80 rounded-xl border border-sky-100 bg-white p-4 shadow">
					<h3 className="mb-3 font-semibold">Evolucion de ingresos</h3>
					<ResponsiveContainer height="100%" width="100%">
						<LineChart data={ventasDiarias}>
							<CartesianGrid strokeDasharray="3 3" />
							<XAxis dataKey="fecha" />
							<YAxis />
							<Tooltip />
							<Legend />
							<Line dataKey="ingresos" stroke="#0ea5e9" strokeWidth={3} type="monotone" />
						</LineChart>
					</ResponsiveContainer>
				</div>

				<div className="h-80 rounded-xl border border-pink-100 bg-white p-4 shadow">
					<h3 className="mb-3 font-semibold">Ventas por categoria</h3>
					<ResponsiveContainer height="100%" width="100%">
						<PieChart>
							<Tooltip />
							<Pie data={categorias} dataKey="ventas" nameKey="categoria" outerRadius={110} fill="#ec4899" />
						</PieChart>
					</ResponsiveContainer>
				</div>
			</div>

			<div className="grid gap-4 lg:grid-cols-2">
				<article className="rounded-xl border border-amber-100 bg-white p-4 shadow">
					<h3 className="font-semibold">Estadistica descriptiva</h3>
					<p className="text-sm">Media: {money(stats?.media)}</p>
					<p className="text-sm">Mediana: {money(stats?.mediana)}</p>
					<p className="text-sm">Moda: {money(stats?.moda)}</p>
				</article>

				<div className="h-64 rounded-xl border border-emerald-100 bg-white p-4 shadow">
					<h3 className="mb-3 font-semibold">Pedidos por hora</h3>
					<ResponsiveContainer height="100%" width="100%">
						<BarChart data={stats?.distribucion_horaria || []}>
							<CartesianGrid strokeDasharray="3 3" />
							<XAxis dataKey="hora" />
							<YAxis />
							<Tooltip />
							<Bar dataKey="pedidos" fill="#22c55e" radius={[4, 4, 0, 0]} />
						</BarChart>
					</ResponsiveContainer>
				</div>
			</div>
		</section>
	);
}
