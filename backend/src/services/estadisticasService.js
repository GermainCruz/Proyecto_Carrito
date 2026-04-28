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
			COALESCE(SUM(CASE WHEN DATE(fecha_pedido) = CURRENT_DATE THEN total END), 0)          AS ventas_hoy,
			COALESCE(SUM(CASE WHEN DATE(fecha_pedido) = CURRENT_DATE - 1 THEN total END), 0)      AS ventas_ayer,
			COALESCE(SUM(total), 0)                                                               AS ingresos_totales,
			COUNT(*)::int                                                                          AS total_pedidos,
			COALESCE(AVG(total), 0)                                                               AS ticket_promedio
		FROM pedidos
		WHERE estado <> 'cancelado'
	`);

	const [[extra]] = await sequelize.query(`
		SELECT
			COUNT(DISTINCT usuario_id)::int                          AS clientes_unicos,
			COUNT(CASE WHEN estado = 'cancelado' THEN 1 END)::int    AS pedidos_cancelados,
			COUNT(CASE WHEN stock <= 10 THEN 1 END)::int             AS productos_bajo_stock
		FROM pedidos
		CROSS JOIN (SELECT stock FROM productos) p
		GROUP BY TRUE
		LIMIT 1
	`).catch(() => [[{ clientes_unicos: 0, pedidos_cancelados: 0, productos_bajo_stock: 0 }]]);

	const [[cancelados]] = await sequelize.query(`
		SELECT COUNT(*)::int AS pedidos_cancelados FROM pedidos WHERE estado = 'cancelado'
	`);

	const [[clientesUnicos]] = await sequelize.query(`
		SELECT COUNT(DISTINCT usuario_id)::int AS clientes_unicos FROM pedidos
	`);

	const [[stockBajo]] = await sequelize.query(`
		SELECT COUNT(*)::int AS productos_bajo_stock FROM productos WHERE stock <= 10
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
		ventas_hoy:            Number(kpis.ventas_hoy || 0),
		ventas_ayer:           Number(kpis.ventas_ayer || 0),
		ingresos_totales:      Number(kpis.ingresos_totales || 0),
		total_pedidos:         Number(kpis.total_pedidos || 0),
		ticket_promedio:       Number(Number(kpis.ticket_promedio || 0).toFixed(2)),
		clientes_unicos:       Number(clientesUnicos.clientes_unicos || 0),
		pedidos_cancelados:    Number(cancelados.pedidos_cancelados || 0),
		productos_bajo_stock:  Number(stockBajo.productos_bajo_stock || 0),
		top_productos:         topProductos,
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

async function getEstadosPedidos() {
	const [rows] = await sequelize.query(`
		SELECT estado, COUNT(*)::int AS cantidad
		FROM pedidos
		GROUP BY estado
		ORDER BY cantidad DESC
	`);
	return rows;
}

async function getTopProductos() {
	const [rows] = await sequelize.query(`
		SELECT p.nombre, p.categoria, SUM(dp.cantidad)::int AS unidades, COALESCE(SUM(dp.subtotal), 0) AS ingresos
		FROM detalle_pedidos dp
		JOIN productos p ON p.id = dp.producto_id
		GROUP BY p.nombre, p.categoria
		ORDER BY unidades DESC
		LIMIT 8
	`);
	return rows.map((r) => ({ ...r, ingresos: Number(r.ingresos) }));
}

module.exports = { getDashboardKPIs, getVentasDiarias, getCategorias, getDescriptiveStats, getEstadosPedidos, getTopProductos };
