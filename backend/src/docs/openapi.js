const openApiSpec = {
	openapi: "3.0.3",
	info: {
		title: "API Ecommerce Carrito",
		version: "1.1.0",
		description: "API REST para autenticacion, carrito, pedidos, pasarela de pago, dashboard y reportes.",
	},
	servers: [{ url: "http://localhost:4000", description: "Servidor local" }],
	tags: [
		{ name: "Health" },
		{ name: "Auth" },
		{ name: "Productos" },
		{ name: "Carrito" },
		{ name: "Pagos", description: "Pasarela de pago: metodos, transacciones y procesamiento" },
		{ name: "Pedidos" },
		{ name: "Dashboard" },
		{ name: "Reportes" },
	],
	paths: {
		"/api/health": {
			get: {
				tags: ["Health"],
				summary: "Health check",
				responses: { "200": { description: "API operativa" } },
			},
		},
		"/api/auth/register": {
			post: {
				tags: ["Auth"],
				summary: "Registrar usuario",
				requestBody: {
					required: true,
					content: {
						"application/json": {
							schema: {
								type: "object",
								required: ["nombre", "correo_electronico", "contrasena"],
								properties: {
									nombre: { type: "string" },
									correo_electronico: { type: "string", format: "email" },
									contrasena: { type: "string" },
									rol: { type: "string", enum: ["admin", "gestor", "cliente"] },
								},
							},
						},
					},
				},
				responses: { "201": { description: "Usuario creado" }, "409": { description: "Correo duplicado" } },
			},
		},
		"/api/auth/login": {
			post: {
				tags: ["Auth"],
				summary: "Iniciar sesion",
				responses: { "200": { description: "Sesion iniciada" }, "401": { description: "Credenciales invalidas" } },
			},
		},
		"/api/auth/me": {
			get: {
				tags: ["Auth"],
				summary: "Perfil de sesion",
				responses: { "200": { description: "Datos del usuario autenticado" }, "401": { description: "No autenticado" } },
			},
		},
		"/api/productos": {
			get: {
				tags: ["Productos"],
				summary: "Listar productos",
				responses: { "200": { description: "Listado exitoso" } },
			},
			post: {
				tags: ["Productos"],
				summary: "Crear producto (admin/gestor)",
				responses: { "201": { description: "Producto creado" }, "403": { description: "No autorizado" } },
			},
		},
		"/api/carrito": {
			get: {
				tags: ["Carrito"],
				summary: "Obtener carrito de usuario",
				responses: { "200": { description: "Carrito actual" } },
			},
		},
		"/api/carrito/items": {
			post: {
				tags: ["Carrito"],
				summary: "Agregar item al carrito",
				responses: { "200": { description: "Carrito actualizado" }, "400": { description: "Stock insuficiente" } },
			},
		},
		"/api/pagos/metodos": {
			get: {
				tags: ["Pagos"],
				summary: "Listar metodos de pago activos en la pasarela",
				responses: {
					"200": {
						description: "Catalogo de metodos disponibles (Visa, Mastercard, Yape, Plin, ...)",
					},
				},
			},
		},
		"/api/pagos/procesar": {
			post: {
				tags: ["Pagos"],
				summary: "Procesar un pago a traves de la pasarela y, si es aprobado, generar el pedido",
				requestBody: {
					required: true,
					content: {
						"application/json": {
							schema: {
								type: "object",
								required: ["metodo_pago_id", "datos_pago"],
								properties: {
									metodo_pago_id: { type: "integer", example: 1 },
									fecha_pedido_cliente: { type: "string", format: "date-time" },
									datos_pago: {
										type: "object",
										description: "Estructura segun el metodo: titular/numero/vencimiento/cvv para tarjeta, telefono/otp para billetera",
										properties: {
											titular: { type: "string" },
											numero_tarjeta: { type: "string" },
											vencimiento: { type: "string", example: "12/29" },
											cvv: { type: "string", example: "123" },
											telefono: { type: "string", example: "999111222" },
											otp: { type: "string", example: "123456" },
										},
									},
								},
							},
						},
					},
				},
				responses: {
					"201": { description: "Pago aprobado, transaccion + pedido generados" },
					"400": { description: "Carrito vacio o datos invalidos" },
					"402": { description: "Pago rechazado por la pasarela" },
				},
			},
		},
		"/api/pagos/mis-transacciones": {
			get: {
				tags: ["Pagos"],
				summary: "Listar transacciones del usuario autenticado",
				responses: { "200": { description: "Listado de transacciones del usuario" } },
			},
		},
		"/api/pagos/transacciones": {
			get: {
				tags: ["Pagos"],
				summary: "Listar todas las transacciones (admin/gestor)",
				responses: { "200": { description: "Transacciones de la pasarela" }, "403": { description: "No autorizado" } },
			},
		},
		"/api/pagos/transacciones/{codigo}": {
			get: {
				tags: ["Pagos"],
				summary: "Obtener una transaccion por su codigo publico",
				parameters: [
					{ name: "codigo", in: "path", required: true, schema: { type: "string" }, example: "TXN-20260420-A1B2C3D4" },
				],
				responses: {
					"200": { description: "Transaccion encontrada" },
					"403": { description: "No autorizado" },
					"404": { description: "Transaccion no encontrada" },
				},
			},
		},
		"/api/pedidos/mis": {
			get: {
				tags: ["Pedidos"],
				summary: "Listar pedidos del usuario",
				responses: { "200": { description: "Pedidos del usuario" } },
			},
		},
		"/api/pedidos": {
			get: {
				tags: ["Pedidos"],
				summary: "Listar todos los pedidos (admin/gestor)",
				responses: { "200": { description: "Pedidos" } },
			},
		},
		"/api/pedidos/{id}/estado": {
			patch: {
				tags: ["Pedidos"],
				summary: "Cambiar el estado de un pedido (admin/gestor)",
				parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }],
				responses: { "200": { description: "Estado actualizado" }, "404": { description: "Pedido no encontrado" } },
			},
		},
		"/api/dashboard/kpis": {
			get: {
				tags: ["Dashboard"],
				summary: "Obtener KPI principales",
				responses: { "200": { description: "KPI del dashboard" } },
			},
		},
		"/api/dashboard/estadisticas-descriptivas": {
			get: {
				tags: ["Dashboard"],
				summary: "Media, mediana, moda y distribuciones",
				responses: { "200": { description: "Estadisticas descriptivas" } },
			},
		},
		"/api/reportes/operacional": {
			get: {
				tags: ["Reportes"],
				summary: "Generar PDF operacional",
				responses: { "200": { description: "PDF generado" } },
			},
		},
		"/api/reportes/gestion": {
			get: {
				tags: ["Reportes"],
				summary: "Generar PDF de gestion",
				responses: { "200": { description: "PDF generado" } },
			},
		},
	},
};

module.exports = openApiSpec;
