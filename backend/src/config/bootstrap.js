const { Client } = require("pg");

const sequelize = require("./database");
const { Usuario, Producto, MetodoPago } = require("../models");
const { hashPassword } = require("../utils/bcryptHelper");

const seedUsuarios = [
	{
		nombre: "Administrador Demo",
		correo_electronico: "admin@demo.com",
		contrasena: hashPassword("admin123"),
		rol: "admin",
		activo: true,
	},
	{
		nombre: "Gestor Demo",
		correo_electronico: "gestor@demo.com",
		contrasena: hashPassword("gestor123"),
		rol: "gestor",
		activo: true,
	},
	{
		nombre: "Cliente Demo",
		correo_electronico: "cliente@demo.com",
		contrasena: hashPassword("cliente123"),
		rol: "cliente",
		activo: true,
	},
];

const seedProductos = [
	{ nombre: "Mouse Inalambrico", descripcion: "Mouse ergonomico recargable", precio: 79.9, stock: 45, categoria: "Perifericos" },
	{ nombre: "Teclado Mecanico", descripcion: "Teclado switch red para gaming y oficina", precio: 189.0, stock: 30, categoria: "Perifericos" },
	{ nombre: "Monitor 24 pulgadas", descripcion: "Panel IPS Full HD 75Hz", precio: 649.0, stock: 20, categoria: "Monitores" },
	{ nombre: "SSD NVMe 1TB", descripcion: "Unidad estado solido PCIe 4.0", precio: 329.0, stock: 25, categoria: "Almacenamiento" },
	{ nombre: "Audifonos Bluetooth", descripcion: "Cancelacion de ruido basica", precio: 149.0, stock: 40, categoria: "Audio" },
];

const seedMetodosPago = [
	{ codigo: "visa",          nombre: "Visa",                  tipo: "tarjeta",       requiere_tarjeta: true,  comision_porcentaje: 3.5, activo: true },
	{ codigo: "mastercard",    nombre: "Mastercard",            tipo: "tarjeta",       requiere_tarjeta: true,  comision_porcentaje: 3.5, activo: true },
	{ codigo: "amex",          nombre: "American Express",      tipo: "tarjeta",       requiere_tarjeta: true,  comision_porcentaje: 4.0, activo: true },
	{ codigo: "yape",          nombre: "Yape",                  tipo: "billetera",     requiere_tarjeta: false, comision_porcentaje: 0.0, activo: true },
	{ codigo: "plin",          nombre: "Plin",                  tipo: "billetera",     requiere_tarjeta: false, comision_porcentaje: 0.0, activo: true },
	{ codigo: "transferencia", nombre: "Transferencia bancaria", tipo: "transferencia", requiere_tarjeta: false, comision_porcentaje: 0.5, activo: true },
];

async function ensureDatabaseExists() {
	if (process.env.DATABASE_URL) {
		return;
	}

	const databaseName = process.env.DB_NAME || "carrito_compras";
	const client = new Client({
		host: process.env.DB_HOST || "localhost",
		port: Number(process.env.DB_PORT || 5432),
		user: process.env.DB_USER || "postgres",
		password: process.env.DB_PASSWORD || "postgres",
		database: "postgres",
	});

	await client.connect();

	try {
		const result = await client.query("SELECT 1 FROM pg_database WHERE datname = $1", [databaseName]);
		if (!result.rowCount) {
			await client.query(`CREATE DATABASE "${databaseName}"`);
		}
	} finally {
		await client.end();
	}
}

async function seedIfNeeded() {
	const usersCount = await Usuario.count();
	if (!usersCount) {
		await Usuario.bulkCreate(seedUsuarios, { ignoreDuplicates: true });
	}

	const productsCount = await Producto.count();
	if (!productsCount) {
		await Producto.bulkCreate(seedProductos, { ignoreDuplicates: true });
	}

	const metodosCount = await MetodoPago.count();
	if (!metodosCount) {
		await MetodoPago.bulkCreate(seedMetodosPago, { ignoreDuplicates: true });
	}
}

async function bootstrapDatabase() {
	await ensureDatabaseExists();
	await sequelize.authenticate();
	await sequelize.sync();
	await seedIfNeeded();
}

module.exports = { bootstrapDatabase };
