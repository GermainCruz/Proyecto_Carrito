const express = require("express");
const cors = require("cors");
const session = require("express-session");
const swaggerUi = require("swagger-ui-express");
const path = require("path");

const authRoutes = require("./routes/authRoutes");
const productoRoutes = require("./routes/productoRoutes");
const carritoRoutes = require("./routes/carritoRoutes");
const pedidoRoutes = require("./routes/pedidoRoutes");
const pagoRoutes = require("./routes/pagoRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const reporteRoutes = require("./routes/reporteRoutes");
const openApiSpec = require("./docs/openapi");
const errorHandler = require("./middlewares/errorHandler");

const app = express();

const defaultOrigins = ["http://localhost:5173", "http://localhost:5174"];
const envOrigins = (process.env.FRONTEND_URLS || process.env.FRONTEND_URL || "")
	.split(",")
	.map((origin) => origin.trim())
	.filter(Boolean);
const allowedOrigins = [...new Set([...envOrigins, ...defaultOrigins])];

app.use(
	cors({
		origin: function (origin, callback) {
			// permitir peticiones sin origen (como apps moviles o curl)
			if (!origin) return callback(null, true);
			if (allowedOrigins.indexOf(origin) === -1) {
				const msg = "The CORS policy for this site does not allow access from the specified Origin.";
				return callback(new Error(msg), false);
			}
			return callback(null, true);
		},
		credentials: true,
	})
);
app.use(express.json());

// Servir los archivos subidos estáticamente de forma que el cliente pueda visualizarlos.
app.use("/uploads", express.static(path.join(__dirname, "..", "uploads")));

const isProduction = process.env.NODE_ENV === "production";

app.set("trust proxy", 1); // necesario para cookies secure en plataformas como Render

app.use(
	session({
		name: "carrito.sid",
		secret: process.env.SESSION_SECRET || "dev_secret_change_me",
		resave: false,
		saveUninitialized: false,
		cookie: {
			maxAge: 1000 * 60 * 60 * 8,
			httpOnly: true,
			sameSite: isProduction ? "none" : "lax",
			secure: isProduction,
		},
	})
);

app.get("/api/health", (_, res) => {
	res.status(200).json({ ok: true, message: "API operativa" });
});

app.get("/api/openapi.json", (_, res) => {
	res.status(200).json(openApiSpec);
});
app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(openApiSpec));

app.use("/api/auth", authRoutes);
app.use("/api/productos", productoRoutes);
app.use("/api/carrito", carritoRoutes);
app.use("/api/pedidos", pedidoRoutes);
app.use("/api/pagos", pagoRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/reportes", reporteRoutes);

app.use((_, res) => {
	res.status(404).json({ ok: false, message: "Ruta no encontrada" });
});

app.use(errorHandler);

module.exports = app;
