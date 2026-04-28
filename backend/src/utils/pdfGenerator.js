const PDFDocument = require("pdfkit");

// ─── Constantes de diseño ────────────────────────────────────────────────────
const COLORS = {
	primary:      "#0f766e",
	primaryDark:  "#0d5e57",
	primaryLight: "#ccfbf1",
	accent:       "#0ea5e9",
	danger:       "#dc2626",
	dangerBg:     "#fff1f2",
	dangerBorder: "#fecaca",
	warning:      "#d97706",
	warningBg:    "#fffbeb",
	dark:         "#0f172a",
	muted:        "#64748b",
	light:        "#f8fafc",
	white:        "#ffffff",
	border:       "#e2e8f0",
	rowEven:      "#f0fdfa",
	rowOdd:       "#f8fafc",
	headerBg:     "#e2e8f0",
	gold:         "#b45309",
};

function money(value) {
	return `S/ ${Number(value || 0).toFixed(2)}`;
}

function createDoc() {
	return new PDFDocument({ margin: 45, size: "A4" });
}

function buildBuffer(doc) {
	const chunks = [];
	return new Promise((resolve) => {
		doc.on("data", (chunk) => chunks.push(chunk));
		doc.on("end", () => resolve(Buffer.concat(chunks)));
	});
}

function contentWidth(doc) {
	return doc.page.width - doc.page.margins.left - doc.page.margins.right;
}

function ensureSpace(doc, requiredHeight = 50) {
	const bottomLimit = doc.page.height - doc.page.margins.bottom;
	if (doc.y + requiredHeight > bottomLimit) {
		doc.addPage();
		doc.y = doc.page.margins.top;
	}
}

// ─── Cabecera del documento ──────────────────────────────────────────────────
function drawHeader(doc, title, subtitle, accentColor = COLORS.primary) {
	const x = doc.page.margins.left;
	const y = doc.page.margins.top;
	const w = contentWidth(doc);
	const h = 90;

	doc.save();
	doc.roundedRect(x, y, w, h, 14).fill(accentColor);
	doc.roundedRect(x + w * 0.55, y, w * 0.45, h, 14).fill(COLORS.primaryDark);
	// Textos
	doc.fillColor(COLORS.white).font("Helvetica-Bold").fontSize(26).text(title, x + 20, y + 18);
	doc.fillColor(COLORS.primaryLight).font("Helvetica").fontSize(11).text(subtitle, x + 20, y + 54);
	// Fecha de generación
	const now = new Date().toLocaleDateString("es-PE") + " " + new Date().toLocaleTimeString("es-PE");
	doc.fillColor(COLORS.primaryLight).fontSize(9).text("Generado: " + now, x + 20, y + 70);
	doc.restore();
	doc.y = y + h + 22;
}

// ─── Tarjetas KPI ────────────────────────────────────────────────────────────
function drawKpiCards(doc, cards) {
	const x = doc.page.margins.left;
	const w = contentWidth(doc);
	const gap = 12;
	const cardW = (w - gap * (cards.length - 1)) / cards.length;
	const cardH = 68;
	const y = doc.y;

	cards.forEach((card, i) => {
		const cx = x + i * (cardW + gap);
		doc.save();
		doc.roundedRect(cx, y, cardW, cardH, 10).fill(COLORS.light);
		doc.roundedRect(cx, y, 4, cardH, 2).fill(card.accent || COLORS.primary);
		doc.fillColor(COLORS.muted).font("Helvetica").fontSize(9).text(card.label, cx + 12, y + 12, { width: cardW - 20 });
		doc.fillColor(card.accent || COLORS.primary).font("Helvetica-Bold").fontSize(17).text(card.value, cx + 12, y + 30, { width: cardW - 20 });
		doc.restore();
	});

	doc.y = y + cardH + 18;
}

// ─── Título de sección ───────────────────────────────────────────────────────
function drawSectionTitle(doc, title) {
	ensureSpace(doc, 32);
	const x = doc.page.margins.left;
	const w = contentWidth(doc);
	const y = doc.y;

	doc.save();
	doc.roundedRect(x, y, w, 26, 6).fill(COLORS.headerBg);
	doc.roundedRect(x, y, 4, 26, 2).fill(COLORS.primary);
	doc.fillColor(COLORS.dark).font("Helvetica-Bold").fontSize(12).text(title, x + 14, y + 7, { width: w - 20 });
	doc.restore();
	doc.y = y + 34;
}

// ─── Fila de tabla genérica ──────────────────────────────────────────────────
function drawTableRow(doc, cols, y, bgColor, textColor = COLORS.dark, isHeader = false) {
	const x = doc.page.margins.left;
	const rowH = isHeader ? 24 : 20;
	doc.save();
	doc.rect(x, y, contentWidth(doc), rowH).fill(bgColor);
	doc.restore();

	let curX = x;
	doc.fillColor(textColor).font(isHeader ? "Helvetica-Bold" : "Helvetica").fontSize(isHeader ? 8 : 9);

	cols.forEach(({ text, width, align = "left" }) => {
		doc.text(String(text || ""), curX + 6, y + (isHeader ? 7 : 5), {
			width: width - 10,
			align,
			lineBreak: false,
		});
		curX += width;
	});

	return rowH;
}

// ─── Caja informativa con líneas de texto ────────────────────────────────────
function drawInfoBox(doc, title, lines, options = {}) {
	const x = doc.page.margins.left;
	const w = contentWidth(doc);
	const padX = 14;
	const padY = 12;
	const fontSize = options.lineFontSize || 10;

	doc.fontSize(11);
	const titleH = doc.heightOfString(title, { width: w - padX * 2 });

	doc.fontSize(fontSize);
	const linesH = lines.reduce(
		(acc, line) => acc + doc.heightOfString(String(line.text || line), { width: w - padX * 2, lineGap: 3 }),
		0
	);

	const boxH = padY * 2 + titleH + 10 + linesH;
	ensureSpace(doc, boxH + 12);

	const y = doc.y;
	doc.save();
	doc.roundedRect(x, y, w, boxH, 8).fill(options.bgColor || COLORS.light);
	if (options.borderColor) {
		doc.roundedRect(x, y, w, boxH, 8).stroke(options.borderColor);
	}
	// Franja lateral
	if (options.accentBar) {
		doc.roundedRect(x, y, 4, boxH, 2).fill(options.accentBar);
	}
	doc.restore();

	doc.fillColor(options.titleColor || COLORS.dark).font("Helvetica-Bold").fontSize(11)
		.text(title, x + padX, y + padY, { width: w - padX * 2 });

	let curY = y + padY + titleH + 10;
	doc.fontSize(fontSize);

	lines.forEach((line) => {
		const isObj = typeof line === "object";
		const text = isObj ? line.text : line;
		const color = isObj && line.color ? line.color : (options.textColor || COLORS.muted);

		doc.fillColor(color).font(isObj && line.bold ? "Helvetica-Bold" : "Helvetica")
			.text(String(text), x + padX, curY, { width: w - padX * 2, lineGap: 3 });

		curY += doc.heightOfString(String(text), { width: w - padX * 2, lineGap: 3 });
	});

	doc.y = y + boxH + 12;
}

// ─── Sección de bajo stock ───────────────────────────────────────────────────
function drawBajoStockSection(doc, bajoStock) {
	if (!bajoStock || !bajoStock.length) return;

	drawSectionTitle(doc, "ALERTA: Productos con stock bajo (stock <= 10)");

	const x = doc.page.margins.left;
	const w = contentWidth(doc);
	const padY = 12;

	const lineCount = bajoStock.length;
	const lineH = 18;
	const boxH = padY * 2 + 22 + lineCount * lineH + 4;

	ensureSpace(doc, boxH + 12);
	const y = doc.y;

	doc.save();
	doc.roundedRect(x, y, w, boxH, 8).fill(COLORS.dangerBg);
	doc.roundedRect(x, y, w, boxH, 8).stroke(COLORS.dangerBorder);
	doc.roundedRect(x, y, 4, boxH, 2).fill(COLORS.danger);
	doc.restore();

	doc.fillColor(COLORS.danger).font("Helvetica-Bold").fontSize(10)
		.text(`Los siguientes ${bajoStock.length} producto(s) tienen stock <= 10 unidades:`, x + padY, y + padY, { width: w - padY * 2 });

	let curY = y + padY + 22;

	// Encabezado de mini-tabla
	doc.save();
	doc.rect(x + 8, curY - 2, w - 16, 16).fill("#fecaca");
	doc.restore();
	doc.fillColor(COLORS.danger).font("Helvetica-Bold").fontSize(8)
		.text("PRODUCTO", x + 14, curY, { width: w * 0.55 })
		.text("CATEGORÍA", x + 14 + w * 0.55, curY, { width: w * 0.22 })
		.text("STOCK", x + w - 60, curY, { align: "right", width: 45 });
	curY += 16;

	bajoStock.forEach((p, i) => {
		const rowBg = i % 2 === 0 ? "#fff1f2" : "#fff5f5";
		doc.save();
		doc.rect(x + 8, curY - 1, w - 16, lineH).fill(rowBg);
		doc.restore();

		doc.fillColor(COLORS.danger).font("Helvetica-Bold").fontSize(9)
			.text(p.nombre, x + 14, curY + 3, { width: w * 0.55, lineBreak: false });
		doc.fillColor(COLORS.muted).font("Helvetica").fontSize(9)
			.text(p.categoria, x + 14 + w * 0.55, curY + 3, { width: w * 0.22, lineBreak: false });

		const stockColor = p.stock === 0 ? COLORS.danger : COLORS.warning;
		doc.fillColor(stockColor).font("Helvetica-Bold").fontSize(9)
			.text(p.stock === 0 ? "AGOTADO" : String(p.stock), x + w - 62, curY + 3, { align: "right", width: 50, lineBreak: false });

		curY += lineH;
	});

	doc.y = y + boxH + 14;
}

// ─── Pie de página ───────────────────────────────────────────────────────────
function drawFooter(doc, pageNum) {
	const x = doc.page.margins.left;
	const w = contentWidth(doc);
	// Posicionado dentro del margen inferior para evitar páginas en blanco
	const y = doc.page.height - doc.page.margins.bottom - 20;

	doc.save();
	doc.strokeColor(COLORS.border).moveTo(x, y).lineTo(x + w, y).stroke();
	doc.fillColor(COLORS.muted).font("Helvetica").fontSize(8)
		.text("CarritoPro - Sistema de Gestion Comercial", x, y + 5, { width: w / 2, lineBreak: false })
		.text(`Pagina ${pageNum}`, x + w / 2, y + 5, { width: w / 2, align: "right", lineBreak: false });
	doc.restore();
}

// ─── REPORTE OPERACIONAL ─────────────────────────────────────────────────────
async function generateOperationalReportPdf(payload) {
	const { startDate, endDate, pedidos, totalPedidos, totalIngresos, bajoStock } = payload;
	const doc = createDoc();
	const bufferPromise = buildBuffer(doc);
	let pageNum = 1;

	drawHeader(doc, "Reporte Operacional", "Periodo: " + startDate + " al " + endDate, COLORS.primary);

	const pedidosCancelados = pedidos.filter((p) => p.estado === "cancelado").length;
	const pedidosActivos = totalPedidos - pedidosCancelados;

	drawKpiCards(doc, [
		{ label: "Total de pedidos", value: String(totalPedidos), accent: COLORS.primary },
		{ label: "Pedidos activos", value: String(pedidosActivos), accent: COLORS.accent },
		{ label: "Cancelados", value: String(pedidosCancelados), accent: COLORS.danger },
		{ label: "Ingresos totales", value: money(totalIngresos), accent: COLORS.gold },
	]);

	drawSectionTitle(doc, "Detalle de pedidos");

	if (!pedidos.length) {
		drawInfoBox(doc, "Sin resultados", ["No se encontraron pedidos en el rango de fechas seleccionado."], {
			bgColor: COLORS.warningBg,
			accentBar: COLORS.warning,
			titleColor: COLORS.warning,
		});
		drawFooter(doc, pageNum);
		doc.end();
		return bufferPromise;
	}

	const colWidths = {
		id:       60,
		fecha:    130,
		cliente:  130,
		estado:   70,
		total:    80,
	};
	const lineW = contentWidth(doc);
	colWidths.total = lineW - colWidths.id - colWidths.fecha - colWidths.cliente - colWidths.estado;

	// Encabezado de tabla
	const theadCols = [
		{ text: "#PEDIDO", width: colWidths.id },
		{ text: "FECHA", width: colWidths.fecha },
		{ text: "CLIENTE", width: colWidths.cliente },
		{ text: "ESTADO", width: colWidths.estado },
		{ text: "TOTAL", width: colWidths.total, align: "right" },
	];

	const tableHeaderY = doc.y;
	drawTableRow(doc, theadCols, tableHeaderY, COLORS.primary, COLORS.white, true);
	doc.y = tableHeaderY + 24;

	pedidos.forEach((pedido, idx) => {
		ensureSpace(doc, 22);

		const rowBg = idx % 2 === 0 ? COLORS.rowEven : COLORS.rowOdd;
		const estadoColor =
			pedido.estado === "cancelado" ? COLORS.danger :
			pedido.estado === "entregado" ? COLORS.primary :
			pedido.estado === "pagado"    ? COLORS.accent  :
			COLORS.dark;

		const rowY = doc.y;
		drawTableRow(
			doc,
			[
				{ text: `#${pedido.id}`, width: colWidths.id },
				{ text: pedido.fecha, width: colWidths.fecha },
				{ text: pedido.cliente, width: colWidths.cliente },
				{ text: (pedido.estado || "").toUpperCase(), width: colWidths.estado, color: estadoColor },
				{ text: money(pedido.total), width: colWidths.total, align: "right" },
			],
			rowY,
			rowBg,
			COLORS.dark
		);
		doc.y = rowY + 20;

		// Detalle de productos dentro del pedido
		if (pedido.detalles?.length) {
			pedido.detalles.forEach((item) => {
				ensureSpace(doc, 16);
				const detY = doc.y;
				doc.save();
				doc.rect(doc.page.margins.left, detY, contentWidth(doc), 16).fill("#f1f5f9");
				doc.restore();

				const textColor = item.bajStock ? COLORS.danger : COLORS.muted;
				const font = item.bajStock ? "Helvetica-Bold" : "Helvetica";
				const stockBadge = item.bajStock ? " [BAJO STOCK]" : "";

				doc.fillColor(textColor).font(font).fontSize(8)
					.text(
						"     - " + item.nombre + stockBadge + "  x" + item.cantidad + "  " + money(item.subtotal),
						doc.page.margins.left + 6, detY + 3,
						{ width: contentWidth(doc) - 12, lineBreak: false }
					);
				doc.y = detY + 16;
			});
		}
	});

	doc.moveDown(1);
	drawBajoStockSection(doc, bajoStock);
	drawFooter(doc, pageNum);
	doc.end();
	return bufferPromise;
}

// ─── REPORTE DE GESTIÓN ──────────────────────────────────────────────────────
async function generateManagementReportPdf(payload) {
	const { startDate, endDate, pedidos, ingresos, ticketPromedio, categorias, topProductos, bajoStock } = payload;
	const doc = createDoc();
	const bufferPromise = buildBuffer(doc);
	let pageNum = 1;

	drawHeader(doc, "Reporte de Gestion", "Periodo analizado: " + startDate + " al " + endDate, COLORS.primaryDark);

	drawKpiCards(doc, [
		{ label: "Pedidos (excl. cancelados)", value: String(pedidos), accent: COLORS.primary },
		{ label: "Ingresos netos", value: money(ingresos), accent: COLORS.gold },
		{ label: "Ticket promedio", value: money(ticketPromedio), accent: COLORS.accent },
	]);

	// ── Ventas por categoría ────────────────────────────────────────────────
	drawSectionTitle(doc, "Desempeno por categoria");

	if (categorias.length) {
		const totalVentas = categorias.reduce((a, c) => a + c.ventas, 0);

		// Encabezado
		const catColW = [contentWidth(doc) * 0.45, contentWidth(doc) * 0.3, contentWidth(doc) * 0.25];
		const thY = doc.y;
		drawTableRow(
			doc,
			[
				{ text: "CATEGORÍA", width: catColW[0] },
				{ text: "VENTAS (S/)", width: catColW[1], align: "right" },
				{ text: "% DEL TOTAL", width: catColW[2], align: "right" },
			],
			thY,
			COLORS.primary,
			COLORS.white,
			true
		);
		doc.y = thY + 24;

		categorias.forEach((c, i) => {
			ensureSpace(doc, 20);
			const pct = totalVentas ? ((c.ventas / totalVentas) * 100).toFixed(1) : "0.0";
			const rowY = doc.y;
			drawTableRow(
				doc,
				[
					{ text: c.categoria, width: catColW[0] },
					{ text: money(c.ventas), width: catColW[1], align: "right" },
					{ text: `${pct}%`, width: catColW[2], align: "right" },
				],
				rowY,
				i % 2 === 0 ? COLORS.rowEven : COLORS.rowOdd,
				COLORS.dark
			);
			doc.y = rowY + 20;
		});

		doc.moveDown(0.8);
	} else {
		drawInfoBox(doc, "Sin datos de categoría", ["No hay ventas registradas para el periodo."], {
			bgColor: COLORS.warningBg, accentBar: COLORS.warning, titleColor: COLORS.warning,
		});
	}

	// ── Top productos ────────────────────────────────────────────────────────
	drawSectionTitle(doc, "Top productos vendidos");

	if (topProductos.length) {
		const prodColW = [40, contentWidth(doc) * 0.55, contentWidth(doc) * 0.3 - 40];
		const thY2 = doc.y;
		drawTableRow(
			doc,
			[
				{ text: "#", width: prodColW[0] },
				{ text: "PRODUCTO", width: prodColW[1] },
				{ text: "UNIDADES", width: prodColW[2], align: "right" },
			],
			thY2,
			COLORS.primary,
			COLORS.white,
			true
		);
		doc.y = thY2 + 24;

		topProductos.forEach((p, i) => {
			ensureSpace(doc, 20);
			const rowY = doc.y;
			const medalColor = i === 0 ? "#b45309" : i === 1 ? "#6b7280" : i === 2 ? "#92400e" : COLORS.dark;
			drawTableRow(
				doc,
				[
					{ text: String(i + 1), width: prodColW[0] },
					{ text: p.nombre, width: prodColW[1] },
					{ text: String(p.cantidad), width: prodColW[2], align: "right" },
				],
				rowY,
				i % 2 === 0 ? COLORS.rowEven : COLORS.rowOdd,
				i < 3 ? medalColor : COLORS.dark
			);
			doc.y = rowY + 20;
		});

		doc.moveDown(0.8);
	} else {
		drawInfoBox(doc, "Sin ventas registradas", ["No hay productos vendidos en el periodo para generar el ranking."], {
			bgColor: COLORS.warningBg, accentBar: COLORS.warning, titleColor: COLORS.warning,
		});
	}

	// ── Recomendación estratégica ─────────────────────────────────────────────
	drawSectionTitle(doc, "Recomendacion estrategica");

	const topNombre = topProductos[0]?.nombre || "los productos principales";
	const topCategoria = categorias[0]?.categoria || "la categoría líder";
	const lowCategoria = categorias[categorias.length - 1]?.categoria;

	const recomLines = [
		{ text: "- Priorizar la reposicion de stock en: " + topNombre + ".", bold: true },
		{ text: "- La categoria con mayor contribucion es " + topCategoria + ". Refuerza campanas en categorias con menor participacion" + (lowCategoria ? " como " + lowCategoria : "") + "." },
		{ text: "- Ticket promedio del periodo: " + money(ticketPromedio) + ". Evalua estrategias de upsell para incrementarlo." },
	];

	if (bajoStock?.length) {
		recomLines.push({ text: `• ALERTA: ${bajoStock.length} producto(s) con stock critico detectados. Ver seccion de alertas abajo.`, color: COLORS.danger, bold: true });
	}

	drawInfoBox(doc, "Acciones recomendadas", recomLines, {
		bgColor: "#f0fdfa",
		borderColor: COLORS.primaryLight,
		accentBar: COLORS.primary,
		titleColor: COLORS.primaryDark,
		textColor: COLORS.dark,
		lineFontSize: 10,
	});

	drawBajoStockSection(doc, bajoStock);
	drawFooter(doc, pageNum);
	doc.end();
	return bufferPromise;
}

module.exports = { generateOperationalReportPdf, generateManagementReportPdf };
