const { Sequelize } = require("sequelize");

const databaseUrl = process.env.DATABASE_URL;
const useSsl = String(process.env.DATABASE_SSL || "").toLowerCase() === "true" || Boolean(databaseUrl);

const baseOptions = {
	dialect: "postgres",
	logging: false,
	timezone: "-05:00",
	dialectOptions: {
		useUTC: false,
		...(useSsl
			? {
				ssl: {
					require: true,
					rejectUnauthorized: false,
				},
			}
			: {}),
	},
};

const sequelize = databaseUrl
	? new Sequelize(databaseUrl, baseOptions)
	: new Sequelize(
			process.env.DB_NAME || "carrito_compras",
			process.env.DB_USER || "postgres",
			process.env.DB_PASSWORD || "postgres",
			{
				...baseOptions,
				host: process.env.DB_HOST || "localhost",
				port: Number(process.env.DB_PORT || 5432),
			}
		);

module.exports = sequelize;
