import { useEffect, useState } from "react";
import {
	Bar,
	BarChart,
	CartesianGrid,
	Cell,
	Legend,
	Line,
	LineChart,
	Pie,
	PieChart,
	RadialBar,
	RadialBarChart,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from "recharts";

import carritoService from "../services/carritoService";
import { money } from "../utils/formateadores";

// ─── Paletas de colores ────────────────────────────────────────────────────
const PIE_COLORS  = ["#0ea5e9","#10b981","#f59e0b","#8b5cf6","#f43f5e","#14b8a6","#6366f1","#fb923c"];
const BAR_COLORS  = ["#6366f1","#8b5cf6","#a855f7","#ec4899","#f43f5e","#f59e0b","#10b981","#0ea5e9"];
const ESTADO_COLORS = {
	pagado:    "#0ea5e9",
	entregado: "#10b981",
	enviado:   "#6366f1",
	pendiente: "#f59e0b",
	cancelado: "#f43f5e",
};

// ─── Configuración de KPI cards ────────────────────────────────────────────
const KPI_CONFIGS = [
	{
		key: "ventas_hoy",
		label: "Ventas hoy",
		format: "money",
		gradient: "from-emerald-500 to-teal-500",
		icon: (
			<svg className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
				<path d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8V6m0 12v-2M3 12h18" strokeLinecap="round" strokeLinejoin="round" />
			</svg>
		),
	},
	{
		key: "ingresos_totales",
		label: "Ingresos totales",
		format: "money",
		gradient: "from-sky-500 to-indigo-500",
		icon: (
			<svg className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
				<path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" strokeLinecap="round" strokeLinejoin="round" />
			</svg>
		),
	},
	{
		key: "total_pedidos",
		label: "Pedidos activos",
		format: "number",
		gradient: "from-violet-500 to-purple-600",
		icon: (
			<svg className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
				<path d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" strokeLinecap="round" strokeLinejoin="round" />
			</svg>
		),
	},
	{
		key: "ticket_promedio",
		label: "Ticket promedio",
		format: "money",
		gradient: "from-amber-400 to-orange-500",
		icon: (
			<svg className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
				<path d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" strokeLinecap="round" strokeLinejoin="round" />
			</svg>
		),
	},
	{
		key: "clientes_unicos",
		label: "Clientes únicos",
		format: "number",
		gradient: "from-pink-500 to-rose-500",
		icon: (
			<svg className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
				<path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" strokeLinecap="round" strokeLinejoin="round" />
			</svg>
		),
	},
	{
		key: "productos_bajo_stock",
		label: "Bajo stock",
		format: "number",
		gradient: "from-red-500 to-rose-600",
		alert: true,
		icon: (
			<svg className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
				<path d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" strokeLinecap="round" strokeLinejoin="round" />
			</svg>
		),
	},
];

// ─── Tooltip personalizado ──────────────────────────────────────────────────
function CustomTooltip({ active, payload, label, prefix = "" }) {
	if (!active || !payload?.length) return null;
	return (
		<div className="rounded-xl border border-slate-100 bg-white px-4 py-3 shadow-xl text-sm">
			{label && <p className="mb-1 font-semibold text-slate-700">{label}</p>}
			{payload.map((entry, i) => (
				<p key={i} style={{ color: entry.color || entry.fill }}>
					{entry.name}: <strong>{prefix}{typeof entry.value === "number" && prefix === "S/ " ? entry.value.toFixed(2) : entry.value}</strong>
				</p>
			))}
		</div>
	);
}

function MoneyTooltip(props) { return <CustomTooltip {...props} prefix="S/ " />; }

// ─── Label personalizado para Pie ──────────────────────────────────────────
function renderPieLabel({ cx, cy, midAngle, innerRadius, outerRadius, percent, name }) {
	if (percent < 0.05) return null;
	const RADIAN = Math.PI / 180;
	const radius = innerRadius + (outerRadius - innerRadius) * 0.55;
	const x = cx + radius * Math.cos(-midAngle * RADIAN);
	const y = cy + radius * Math.sin(-midAngle * RADIAN);
	return (
		<text dominantBaseline="central" fill="#fff" fontSize={11} fontWeight="bold" textAnchor="middle" x={x} y={y}>
			{`${(percent * 100).toFixed(0)}%`}
		</text>
	);
}

// ─── Section wrapper ────────────────────────────────────────────────────────
function Section({ title, children, className = "" }) {
	return (
		<div className={`rounded-2xl border border-slate-100 bg-white shadow-sm ${className}`}>
			{title && (
				<div className="border-b border-slate-100 px-5 py-3">
					<h3 className="font-bold text-slate-800">{title}</h3>
				</div>
			)}
			<div className="p-5">{children}</div>
		</div>
	);
}

// ─── Stat mini card ─────────────────────────────────────────────────────────
function StatCard({ label, value, color, sub }) {
	return (
		<div className={`rounded-xl border-l-4 bg-slate-50 px-4 py-3`} style={{ borderColor: color }}>
			<p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{label}</p>
			<p className="mt-1 text-xl font-extrabold" style={{ color }}>{value}</p>
			{sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
		</div>
	);
}

// ─── Componente principal ───────────────────────────────────────────────────
export default function Dashboard() {
	const [kpis, setKpis]                 = useState(null);
	const [ventasDiarias, setVentasDiarias] = useState([]);
	const [categorias, setCategorias]     = useState([]);
	const [stats, setStats]               = useState(null);
	const [estadosPedidos, setEstadosPedidos] = useState([]);
	const [topProductos, setTopProductos] = useState([]);
	const [loading, setLoading]           = useState(true);

	useEffect(() => {
		Promise.all([
			carritoService.getDashboardKpis(),
			carritoService.getVentasDiarias(),
			carritoService.getCategorias(),
			carritoService.getEstadisticas(),
			carritoService.getEstadosPedidos(),
			carritoService.getTopProductosDashboard(),
		]).then(([k, vd, c, s, ep, tp]) => {
			setKpis(k);
			setVentasDiarias(vd.map((d) => ({ ...d, fecha: String(d.fecha).slice(5) })));
			setCategorias(c);
			setStats(s);
			setEstadosPedidos(ep.map((e) => ({ ...e, fill: ESTADO_COLORS[e.estado] || "#94a3b8" })));
			setTopProductos(tp);
			setLoading(false);
		});
	}, []);

	const variacionHoy = kpis
		? kpis.ventas_ayer > 0
			? (((kpis.ventas_hoy - kpis.ventas_ayer) / kpis.ventas_ayer) * 100).toFixed(1)
			: null
		: null;

	if (loading) {
		return (
			<div className="flex h-64 items-center justify-center">
				<div className="h-10 w-10 animate-spin rounded-full border-4 border-sky-200 border-t-sky-600" />
			</div>
		);
	}

	return (
		<div className="space-y-6">
			{/* ── Encabezado ─────────────────────────────────── */}
			<div className="flex flex-wrap items-center justify-between gap-2">
				<div>
					<h2 className="text-3xl font-extrabold text-slate-900">Dashboard comercial</h2>
					<p className="text-sm text-slate-500">Vista general de métricas y rendimiento</p>
				</div>
				<span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
					Datos en tiempo real
				</span>
			</div>

			{/* ── KPI Cards ──────────────────────────────────── */}
			<div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
				{KPI_CONFIGS.map((cfg) => {
					const raw = kpis?.[cfg.key] ?? 0;
					const display = cfg.format === "money" ? money(raw) : String(raw);
					return (
						<article
							className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${cfg.gradient} p-4 text-white shadow-lg`}
							key={cfg.key}
						>
							<div className="flex items-start justify-between">
								<div className="rounded-xl bg-white/20 p-2">{cfg.icon}</div>
								{cfg.key === "ventas_hoy" && variacionHoy !== null && (
									<span className={`rounded-full px-2 py-0.5 text-xs font-bold ${Number(variacionHoy) >= 0 ? "bg-white/25" : "bg-white/15"}`}>
										{Number(variacionHoy) >= 0 ? "+" : ""}{variacionHoy}%
									</span>
								)}
								{cfg.alert && raw > 0 && (
									<span className="animate-pulse rounded-full bg-white/30 px-2 py-0.5 text-xs font-bold">
										Alerta
									</span>
								)}
							</div>
							<p className="mt-3 text-sm font-medium text-white/80">{cfg.label}</p>
							<p className="text-2xl font-extrabold leading-tight">{display}</p>
							<div className="absolute -right-4 -bottom-4 h-20 w-20 rounded-full bg-white/10" />
						</article>
					);
				})}
			</div>

			{/* ── Fila 1: Línea de ingresos + Pie de categorías ── */}
			<div className="grid gap-5 lg:grid-cols-5">
				<Section className="lg:col-span-3" title="Evolución de ingresos (últimos 30 días)">
					<ResponsiveContainer height={260} width="100%">
						<LineChart data={ventasDiarias} margin={{ top: 4, right: 16, left: 0, bottom: 4 }}>
							<defs>
								<linearGradient id="gradIngreso" x1="0" y1="0" x2="0" y2="1">
									<stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3} />
									<stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
								</linearGradient>
							</defs>
							<CartesianGrid stroke="#f1f5f9" strokeDasharray="4 4" />
							<XAxis dataKey="fecha" tick={{ fontSize: 11, fill: "#64748b" }} />
							<YAxis tick={{ fontSize: 11, fill: "#64748b" }} tickFormatter={(v) => `S/${v}`} />
							<Tooltip content={<MoneyTooltip />} />
							<Legend />
							<Line
								dataKey="ingresos"
								dot={false}
								name="Ingresos (S/)"
								stroke="#0ea5e9"
								strokeWidth={3}
								type="monotone"
							/>
							<Line
								dataKey="pedidos"
								dot={false}
								name="Pedidos"
								stroke="#8b5cf6"
								strokeWidth={2}
								strokeDasharray="5 3"
								type="monotone"
								yAxisId="right"
							/>
							<YAxis orientation="right" tick={{ fontSize: 11, fill: "#8b5cf6" }} yAxisId="right" />
						</LineChart>
					</ResponsiveContainer>
				</Section>

				<Section className="lg:col-span-2" title="Ventas por categoría">
					<ResponsiveContainer height={260} width="100%">
						<PieChart>
							<Tooltip
								formatter={(value) => [`S/ ${Number(value).toFixed(2)}`, "Ventas"]}
							/>
							<Legend
								formatter={(value) => <span className="text-xs text-slate-600">{value}</span>}
								iconSize={10}
								iconType="circle"
							/>
							<Pie
								cx="50%"
								cy="45%"
								data={categorias}
								dataKey="ventas"
								innerRadius={45}
								labelLine={false}
								nameKey="categoria"
								outerRadius={95}
								paddingAngle={3}
								label={renderPieLabel}
							>
								{categorias.map((_, i) => (
									<Cell fill={PIE_COLORS[i % PIE_COLORS.length]} key={i} stroke="none" />
								))}
							</Pie>
						</PieChart>
					</ResponsiveContainer>
				</Section>
			</div>

			{/* ── Fila 2: Top productos + Estados de pedidos ── */}
			<div className="grid gap-5 lg:grid-cols-5">
				<Section className="lg:col-span-3" title="Top productos vendidos (unidades)">
					<ResponsiveContainer height={260} width="100%">
						<BarChart
							data={topProductos}
							layout="vertical"
							margin={{ top: 4, right: 40, left: 0, bottom: 4 }}
						>
							<CartesianGrid horizontal={false} stroke="#f1f5f9" strokeDasharray="4 4" />
							<XAxis tick={{ fontSize: 11, fill: "#64748b" }} type="number" />
							<YAxis
								dataKey="nombre"
								tick={{ fontSize: 10, fill: "#64748b" }}
								type="category"
								width={115}
							/>
							<Tooltip content={<CustomTooltip />} />
							<Bar dataKey="unidades" name="Unidades" radius={[0, 6, 6, 0]}>
								{topProductos.map((_, i) => (
									<Cell fill={BAR_COLORS[i % BAR_COLORS.length]} key={i} />
								))}
							</Bar>
						</BarChart>
					</ResponsiveContainer>
				</Section>

				<Section className="lg:col-span-2" title="Estados de pedidos">
					{estadosPedidos.length ? (
						<>
							<ResponsiveContainer height={180} width="100%">
								<RadialBarChart
									cx="50%"
									cy="50%"
									data={estadosPedidos}
									endAngle={-270}
									innerRadius={30}
									outerRadius={90}
									startAngle={90}
								>
									<RadialBar
										background={{ fill: "#f8fafc" }}
										cornerRadius={6}
										dataKey="cantidad"
										label={{ position: "insideStart", fill: "#fff", fontSize: 10, fontWeight: "bold" }}
									/>
									<Tooltip
										formatter={(v, name, props) => [v, props.payload.estado]}
									/>
									<Legend
										formatter={(_, entry) => (
											<span className="text-xs capitalize text-slate-600">{entry.payload.estado}</span>
										)}
										iconSize={10}
										iconType="circle"
									/>
								</RadialBarChart>
							</ResponsiveContainer>
							<div className="mt-2 flex flex-wrap gap-2">
								{estadosPedidos.map((e) => (
									<span
										className="rounded-full px-2.5 py-0.5 text-xs font-semibold text-white"
										key={e.estado}
										style={{ backgroundColor: ESTADO_COLORS[e.estado] || "#94a3b8" }}
									>
										{e.estado}: {e.cantidad}
									</span>
								))}
							</div>
						</>
					) : (
						<p className="py-8 text-center text-sm text-slate-400">Sin datos de pedidos</p>
					)}
				</Section>
			</div>

			{/* ── Fila 3: Estadísticas descriptivas ───────────── */}
			<Section title="Estadísticas descriptivas de compras">
				<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
					<StatCard
						color="#0ea5e9"
						label="Media del ticket"
						sub="Promedio aritmético de montos"
						value={money(stats?.media)}
					/>
					<StatCard
						color="#10b981"
						label="Mediana del ticket"
						sub="Valor central de la distribución"
						value={money(stats?.mediana)}
					/>
					<StatCard
						color="#8b5cf6"
						label="Moda del ticket"
						sub="Monto más frecuente"
						value={money(stats?.moda)}
					/>
					<StatCard
						color="#f59e0b"
						label="Pedidos cancelados"
						sub="Total histórico"
						value={String(kpis?.pedidos_cancelados ?? 0)}
					/>
				</div>
			</Section>

			{/* ── Fila 4: Hora y día de semana ───────────────── */}
			<div className="grid gap-5 lg:grid-cols-2">
				<Section title="Pedidos por hora del día">
					<ResponsiveContainer height={220} width="100%">
						<BarChart
							data={(stats?.distribucion_horaria || []).map((h) => ({ ...h, hora: `${h.hora}h` }))}
							margin={{ top: 4, right: 8, left: 0, bottom: 4 }}
						>
							<CartesianGrid stroke="#f1f5f9" strokeDasharray="4 4" />
							<XAxis dataKey="hora" tick={{ fontSize: 11, fill: "#64748b" }} />
							<YAxis allowDecimals={false} tick={{ fontSize: 11, fill: "#64748b" }} />
							<Tooltip content={<CustomTooltip />} />
							<Bar dataKey="pedidos" name="Pedidos" radius={[5, 5, 0, 0]}>
								{(stats?.distribucion_horaria || []).map((_, i) => (
									<Cell fill={`hsl(${200 + i * 8}, 70%, 55%)`} key={i} />
								))}
							</Bar>
						</BarChart>
					</ResponsiveContainer>
				</Section>

				<Section title="Pedidos por día de la semana">
					<ResponsiveContainer height={220} width="100%">
						<BarChart
							data={stats?.distribucion_dias || []}
							margin={{ top: 4, right: 8, left: 0, bottom: 4 }}
						>
							<CartesianGrid stroke="#f1f5f9" strokeDasharray="4 4" />
							<XAxis dataKey="dia" tick={{ fontSize: 11, fill: "#64748b" }} />
							<YAxis allowDecimals={false} tick={{ fontSize: 11, fill: "#64748b" }} />
							<Tooltip content={<CustomTooltip />} />
							<Bar dataKey="pedidos" name="Pedidos" radius={[5, 5, 0, 0]}>
								{(stats?.distribucion_dias || []).map((_, i) => (
									<Cell fill={PIE_COLORS[i % PIE_COLORS.length]} key={i} />
								))}
							</Bar>
						</BarChart>
					</ResponsiveContainer>
				</Section>
			</div>

			{/* ── Fila 5: Top productos por ingresos ────────── */}
			<Section title="Top productos por ingresos generados (S/)">
				<ResponsiveContainer height={240} width="100%">
					<BarChart
						data={topProductos}
						margin={{ top: 4, right: 16, left: 0, bottom: 4 }}
					>
						<CartesianGrid stroke="#f1f5f9" strokeDasharray="4 4" />
						<XAxis
							dataKey="nombre"
							tick={{ fontSize: 10, fill: "#64748b" }}
							tickFormatter={(v) => v.length > 12 ? v.slice(0, 12) + "…" : v}
						/>
						<YAxis tick={{ fontSize: 11, fill: "#64748b" }} tickFormatter={(v) => `S/${v}`} />
						<Tooltip content={<MoneyTooltip />} />
						<Bar dataKey="ingresos" name="Ingresos (S/)" radius={[6, 6, 0, 0]}>
							{topProductos.map((_, i) => (
								<Cell fill={BAR_COLORS[i % BAR_COLORS.length]} key={i} />
							))}
						</Bar>
					</BarChart>
				</ResponsiveContainer>
			</Section>
		</div>
	);
}
