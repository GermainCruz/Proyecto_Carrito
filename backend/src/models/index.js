const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Usuario = sequelize.define(
	"Usuario",
	{
		id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
		nombre: { type: DataTypes.STRING(100), allowNull: false },
		correo_electronico: { type: DataTypes.STRING(100), allowNull: false, unique: true },
		contrasena: { type: DataTypes.TEXT, allowNull: false },
		rol: {
			type: DataTypes.STRING(20),
			allowNull: false,
			validate: { isIn: [["admin", "gestor", "cliente"]] },
		},
		fecha_registro: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
		activo: { type: DataTypes.BOOLEAN, defaultValue: true },
	},
	{
		tableName: "usuarios",
		timestamps: false,
	}
);

const Producto = sequelize.define(
	"Producto",
	{
		id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
		nombre: { type: DataTypes.STRING(150), allowNull: false },
		descripcion: { type: DataTypes.TEXT },
		precio: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
		stock: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
		categoria: { type: DataTypes.STRING(50) },
		imagen_url: { type: DataTypes.TEXT },
		fecha_creacion: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
	},
	{
		tableName: "productos",
		timestamps: false,
	}
);

const Carrito = sequelize.define(
	"Carrito",
	{
		id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
		usuario_id: { type: DataTypes.INTEGER, allowNull: false, unique: true },
		fecha_creacion: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
		fecha_actualizacion: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
	},
	{
		tableName: "carrito",
		timestamps: false,
	}
);

const CarritoProducto = sequelize.define(
	"CarritoProducto",
	{
		id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
		carrito_id: { type: DataTypes.INTEGER, allowNull: false },
		producto_id: { type: DataTypes.INTEGER, allowNull: false },
		cantidad: { type: DataTypes.INTEGER, allowNull: false },
		precio_unitario: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
	},
	{
		tableName: "carrito_productos",
		timestamps: false,
	}
);

const MetodoPago = sequelize.define(
	"MetodoPago",
	{
		id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
		codigo: { type: DataTypes.STRING(30), allowNull: false, unique: true },
		nombre: { type: DataTypes.STRING(50), allowNull: false },
		tipo: {
			type: DataTypes.STRING(20),
			allowNull: false,
			validate: { isIn: [["tarjeta", "billetera", "transferencia"]] },
		},
		requiere_tarjeta: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
		comision_porcentaje: { type: DataTypes.DECIMAL(5, 2), allowNull: false, defaultValue: 0 },
		activo: { type: DataTypes.BOOLEAN, defaultValue: true },
		fecha_creacion: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
	},
	{
		tableName: "metodos_pago",
		timestamps: false,
	}
);

const Pedido = sequelize.define(
	"Pedido",
	{
		id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
		usuario_id: { type: DataTypes.INTEGER, allowNull: false },
		fecha_pedido: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
		estado: {
			type: DataTypes.STRING(20),
			allowNull: false,
			defaultValue: "pendiente",
			validate: { isIn: [["pendiente", "pagado", "enviado", "entregado", "cancelado"]] },
		},
		total: { type: DataTypes.DECIMAL(12, 2), allowNull: false },
		metodo_pago_id: { type: DataTypes.INTEGER, allowNull: false },
		fecha_creacion: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
	},
	{
		tableName: "pedidos",
		timestamps: false,
	}
);

const DetallePedido = sequelize.define(
	"DetallePedido",
	{
		id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
		pedido_id: { type: DataTypes.INTEGER, allowNull: false },
		producto_id: { type: DataTypes.INTEGER, allowNull: false },
		cantidad: { type: DataTypes.INTEGER, allowNull: false },
		precio_unitario: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
		subtotal: { type: DataTypes.DECIMAL(12, 2) },
	},
	{
		tableName: "detalle_pedidos",
		timestamps: false,
	}
);

const TransaccionPago = sequelize.define(
	"TransaccionPago",
	{
		id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
		codigo_transaccion: { type: DataTypes.STRING(40), allowNull: false, unique: true },
		usuario_id: { type: DataTypes.INTEGER, allowNull: false },
		metodo_pago_id: { type: DataTypes.INTEGER, allowNull: false },
		pedido_id: { type: DataTypes.INTEGER, allowNull: true },
		monto: { type: DataTypes.DECIMAL(12, 2), allowNull: false },
		moneda: { type: DataTypes.STRING(3), allowNull: false, defaultValue: "PEN" },
		estado: {
			type: DataTypes.STRING(20),
			allowNull: false,
			defaultValue: "iniciada",
			validate: { isIn: [["iniciada", "procesando", "aprobada", "rechazada", "reembolsada"]] },
		},
		tarjeta_titular: { type: DataTypes.STRING(100) },
		tarjeta_ultimos_4: { type: DataTypes.STRING(4) },
		tarjeta_marca: { type: DataTypes.STRING(20) },
		telefono_billetera: { type: DataTypes.STRING(20) },
		codigo_autorizacion: { type: DataTypes.STRING(30) },
		referencia_externa: { type: DataTypes.STRING(50) },
		motivo_rechazo: { type: DataTypes.STRING(255) },
		fecha_iniciada: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
		fecha_procesada: { type: DataTypes.DATE },
		fecha_actualizacion: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
	},
	{
		tableName: "transacciones_pago",
		timestamps: false,
	}
);

// ─── Relaciones ───────────────────────────────────────────────────────────────
Usuario.hasOne(Carrito, { foreignKey: "usuario_id", as: "carrito" });
Carrito.belongsTo(Usuario, { foreignKey: "usuario_id", as: "usuario" });

Carrito.hasMany(CarritoProducto, { foreignKey: "carrito_id", as: "items" });
CarritoProducto.belongsTo(Carrito, { foreignKey: "carrito_id", as: "carrito" });
CarritoProducto.belongsTo(Producto, { foreignKey: "producto_id", as: "producto" });

Usuario.hasMany(Pedido, { foreignKey: "usuario_id", as: "pedidos" });
Pedido.belongsTo(Usuario, { foreignKey: "usuario_id", as: "usuario" });

Pedido.hasMany(DetallePedido, { foreignKey: "pedido_id", as: "detalles" });
DetallePedido.belongsTo(Pedido, { foreignKey: "pedido_id", as: "pedido" });
DetallePedido.belongsTo(Producto, { foreignKey: "producto_id", as: "producto" });

// Pasarela de pago
MetodoPago.hasMany(Pedido, { foreignKey: "metodo_pago_id", as: "pedidos" });
Pedido.belongsTo(MetodoPago, { foreignKey: "metodo_pago_id", as: "metodo_pago" });

MetodoPago.hasMany(TransaccionPago, { foreignKey: "metodo_pago_id", as: "transacciones" });
TransaccionPago.belongsTo(MetodoPago, { foreignKey: "metodo_pago_id", as: "metodo_pago" });

Usuario.hasMany(TransaccionPago, { foreignKey: "usuario_id", as: "transacciones_pago" });
TransaccionPago.belongsTo(Usuario, { foreignKey: "usuario_id", as: "usuario" });

Pedido.hasOne(TransaccionPago, { foreignKey: "pedido_id", as: "transaccion_pago" });
TransaccionPago.belongsTo(Pedido, { foreignKey: "pedido_id", as: "pedido" });

module.exports = {
	sequelize,
	Usuario,
	Producto,
	Carrito,
	CarritoProducto,
	MetodoPago,
	Pedido,
	DetallePedido,
	TransaccionPago,
};
