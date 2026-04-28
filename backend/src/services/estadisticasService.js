const { sequelize } = require("../models");

function calcMedian(values) {
	if (!values.length) return 0;
	const sorted = [...values].sort((a, b) => a - b);
	const middle = Math.floor(sorted.length / 2);
	if (sorted.length % 2 === 0) {
		return Number(((sorted[middle - 1] + sorted[middle]) / 2).toFixed(2));
	}
	return Number(sorted[middle].toFixed(2));
}

function calcMode(values) {
	if (!values.length) return 0;
	const freq = new Map();
	values.forEach((v) => {
		const key = Number(v).toFixed(2);
		freq.set(key, (freq.get(key) || 0) + 1);
	});

	let max = 0;
	let mode = 0;
	freq.forEach((count, key) => {
		if (count > max) {
			max = count;
			mode = Number(key);
		}
	});
	return mode;
}

async function getDashboardKPIs() {
	const [[kpis]] = await sequelize.query(`
		SELECT
			COALESCE(SUM(CASE WHEN DATE(fecha_pedido) = CURRENT_DATE THEN total END), 0) AS ventas_hoy,
			COALESCE(SUM(total), 0) AS ingresos_totales,
			COUNT(*) AS total_pedidos
		FROM pedidos
		WHERE estado <> 'cancelado'
	`);

	const [topProductos] = await sequelize.query(`
		SELECT p.nombre, SUM(dp.cantidad)::int AS total_vendido
		FROM detalle_pedidos dp
		JOIN productos p ON p.id = dp.producto_id
		GROUP BY p.nombre
		ORDER BY total_vendido DESC
		LIMIT 5
	`);

	return {
		ventas_hoy: Number(kpis.ventas_hoy || 0),
		ingresos_totales: Number(kpis.ingresos_totales || 0),
		total_pedidos: Number(kpis.total_pedidos || 0),
		top_productos: topProductos,
	};
}

async function getVentasDiarias() {
	const [rows] = await sequelize.query(`
		SELECT DATE(fecha_pedido) AS fecha, COUNT(*)::int AS pedidos, COALESCE(SUM(total), 0) AS ingresos
		FROM pedidos
		WHERE fecha_pedido >= CURRENT_DATE - INTERVAL '30 day'
		GROUP BY DATE(fecha_pedido)
		ORDER BY fecha
	`);
	return rows.map((r) => ({ ...r, ingresos: Number(r.ingresos) }));
}

async function getCategorias() {
	const [rows] = await sequelize.query(`
		SELECT p.categoria, COALESCE(SUM(dp.subtotal), 0) AS ventas
		FROM detalle_pedidos dp
		JOIN productos p ON p.id = dp.producto_id
		GROUP BY p.categoria
		ORDER BY ventas DESC
	`);

	return rows.map((r) => ({ categoria: r.categoria || "Sin categoria", ventas: Number(r.ventas) }));
}

async function getDescriptiveStats() {
	const [rows] = await sequelize.query(`SELECT total FROM pedidos WHERE estado <> 'cancelado'`);
	const totals = rows.map((r) => Number(r.total));
	const media = totals.length
		? Number((totals.reduce((acc, n) => acc + n, 0) / totals.length).toFixed(2))
		: 0;

	const [horarios] = await sequelize.query(`
		SELECT EXTRACT(HOUR FROM fecha_pedido)::int AS hora, COUNT(*)::int AS pedidos
		FROM pedidos
		GROUP BY EXTRACT(HOUR FROM fecha_pedido)
		ORDER BY hora
	`);

	const [dias] = await sequelize.query(`
		SELECT TO_CHAR(fecha_pedido, 'Day') AS dia, COUNT(*)::int AS pedidos
		FROM pedidos
		GROUP BY TO_CHAR(fecha_pedido, 'Day')
		ORDER BY pedidos DESC
	`);

	const [top] = await sequelize.query(`
		SELECT p.nombre, SUM(dp.cantidad)::int AS cantidad
		FROM detalle_pedidos dp
		JOIN productos p ON p.id = dp.producto_id
		GROUP BY p.nombre
		ORDER BY cantidad DESC
		LIMIT 10
	`);

	return {
		media,
		mediana: calcMedian(totals),
		moda: calcMode(totals),
		distribucion_horaria: horarios,
		distribucion_dias: dias.map((d) => ({ dia: d.dia.trim(), pedidos: d.pedidos })),
		top_productos: top,
	};
}

module.exports = { getDashboardKPIs, getVentasDiarias, getCategorias, getDescriptiveStats };
