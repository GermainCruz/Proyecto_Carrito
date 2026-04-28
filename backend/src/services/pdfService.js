const { sequelize } = require("../models");
const { generateOperationalReportPdf, generateManagementReportPdf } = require("../utils/pdfGenerator");

const BAJO_STOCK_UMBRAL = 10;

async function getBajoStock() {
	const [rows] = await sequelize.query(
		`SELECT id, nombre, stock, categoria FROM productos WHERE stock <= :umbral ORDER BY stock ASC`,
		{ replacements: { umbral: BAJO_STOCK_UMBRAL } }
	);
	return rows.map((r) => ({ nombre: r.nombre, stock: Number(r.stock), categoria: r.categoria || "General" }));
}

async function generateOperationalPdf(startDate, endDate) {
	const [rows] = await sequelize.query(
		`
			SELECT
				p.id,
				p.fecha_pedido,
				p.estado,
				p.total,
				u.nombre AS cliente,
				pr.nombre AS producto,
				dp.cantidad,
				dp.subtotal,
				pr.stock AS stock_actual
			FROM pedidos p
			JOIN usuarios u ON u.id = p.usuario_id
			LEFT JOIN detalle_pedidos dp ON dp.pedido_id = p.id
			LEFT JOIN productos pr ON pr.id = dp.producto_id
			WHERE p.fecha_pedido::date BETWEEN :startDate AND :endDate
			ORDER BY p.fecha_pedido DESC, p.id DESC
		`,
		{ replacements: { startDate, endDate } }
	);

	const grouped = new Map();
	rows.forEach((row) => {
		if (!grouped.has(row.id)) {
			grouped.set(row.id, {
				id: row.id,
				fecha: new Date(row.fecha_pedido).toLocaleString("es-PE"),
				estado: row.estado,
				cliente: row.cliente,
				total: Number(row.total),
				detalles: [],
			});
		}

		if (row.producto) {
			grouped.get(row.id).detalles.push({
				nombre: row.producto,
				cantidad: row.cantidad,
				subtotal: Number(row.subtotal || 0),
				bajStock: Number(row.stock_actual || 0) <= BAJO_STOCK_UMBRAL,
			});
		}
	});

	const pedidos = Array.from(grouped.values());
	const totalIngresos = pedidos.reduce((acc, p) => acc + Number(p.total || 0), 0);
	const bajoStock = await getBajoStock();

	return generateOperationalReportPdf({
		startDate,
		endDate,
		pedidos,
		totalPedidos: pedidos.length,
		totalIngresos,
		bajoStock,
	});
}

async function generateManagementPdf(startDate, endDate) {
	const [[summary]] = await sequelize.query(
		`
			SELECT COUNT(*)::int AS pedidos, COALESCE(SUM(total), 0) AS ingresos
			FROM pedidos
			WHERE fecha_pedido::date BETWEEN :startDate AND :endDate
				AND estado <> 'cancelado'
		`,
		{ replacements: { startDate, endDate } }
	);

	const [topProductos] = await sequelize.query(
		`
			SELECT pr.nombre, COALESCE(SUM(dp.cantidad), 0)::int AS cantidad
			FROM detalle_pedidos dp
			JOIN pedidos p ON p.id = dp.pedido_id
			JOIN productos pr ON pr.id = dp.producto_id
			WHERE p.fecha_pedido::date BETWEEN :startDate AND :endDate
			GROUP BY pr.nombre
			ORDER BY cantidad DESC
			LIMIT 6
		`,
		{ replacements: { startDate, endDate } }
	);

	const [categories] = await sequelize.query(
		`
			SELECT COALESCE(pr.categoria, 'Sin categoria') AS categoria, COALESCE(SUM(dp.subtotal), 0) AS ventas
			FROM detalle_pedidos dp
			JOIN pedidos p ON p.id = dp.pedido_id
			JOIN productos pr ON pr.id = dp.producto_id
			WHERE p.fecha_pedido::date BETWEEN :startDate AND :endDate
			GROUP BY pr.categoria
			ORDER BY ventas DESC
		`,
		{ replacements: { startDate, endDate } }
	);

	const pedidos = Number(summary.pedidos || 0);
	const ingresos = Number(summary.ingresos || 0);
	const ticketPromedio = pedidos ? ingresos / pedidos : 0;

	const bajoStock = await getBajoStock();

	return generateManagementReportPdf({
		startDate,
		endDate,
		pedidos,
		ingresos,
		ticketPromedio,
		categorias: categories.map((c) => ({ categoria: c.categoria, ventas: Number(c.ventas || 0) })),
		topProductos: topProductos.map((p) => ({ nombre: p.nombre, cantidad: Number(p.cantidad || 0) })),
		bajoStock,
	});
}

module.exports = { generateOperationalPdf, generateManagementPdf };
