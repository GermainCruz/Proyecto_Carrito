require("dotenv").config();

const app = require("./src/app");
const { bootstrapDatabase } = require("./src/config/bootstrap");

const PORT = process.env.PORT || 4000;

async function startServer() {
	try {
		await bootstrapDatabase();
		const server = app.listen(PORT, () => {
			console.log(`Backend ejecutandose en puerto ${PORT}`);
		});

		server.on("error", (error) => {
			if (error.code === "EADDRINUSE") {
				console.error(`El puerto ${PORT} ya esta en uso. Cierra la otra instancia del backend o cambia PORT en backend/.env`);
				process.exit(1);
			}

			throw error;
		});
	} catch (error) {
		console.error("No se pudo iniciar el backend:", error.message);
		process.exit(1);
	}
}

startServer();
