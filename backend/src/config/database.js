const { Sequelize } = require("sequelize");

const sequelize = new Sequelize(
	process.env.DB_NAME || "carrito_compras",
	process.env.DB_USER || "postgres",
	process.env.DB_PASSWORD || "postgres",
	{
		host: process.env.DB_HOST || "localhost",
		port: Number(process.env.DB_PORT || 5432),
		dialect: "postgres",
		logging: false,
		timezone: "-05:00",
		dialectOptions: {
			useUTC: false,
		},
	}
);

module.exports = sequelize;
