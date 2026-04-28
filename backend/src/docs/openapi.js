const openApiSpec = {
	openapi: "3.0.3",
	info: {
		title: "API Ecommerce Carrito",
		version: "1.0.0",
		description: "API REST para autenticacion, carrito, pedidos, dashboard y reportes.",
	},
	servers: [{ url: "http://localhost:4000", description: "Servidor local" }],
	tags: [
		{ name: "Health" },
		{ name: "Auth" },
		{ name: "Productos" },
		{ name: "Carrito" },
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
		"/api/pedidos/checkout": {
			post: {
				tags: ["Pedidos"],
				summary: "Finalizar compra",
				responses: { "201": { description: "Pedido creado" }, "400": { description: "Carrito vacio o stock insuficiente" } },
			},
		},
		"/api/pedidos/mis": {
			get: {
				tags: ["Pedidos"],
				summary: "Listar pedidos del usuario",
				responses: { "200": { description: "Pedidos del usuario" } },
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