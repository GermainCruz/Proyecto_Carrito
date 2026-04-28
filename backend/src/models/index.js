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
		metodo_pago_simulado: { type: DataTypes.STRING(50) },
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
		subtotal: { type: DataTypes.DECIMAL(12, 2) }, // Columna generada en BD
	},
	{
		tableName: "detalle_pedidos",
		timestamps: false,
	}
);

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

module.exports = {
	sequelize,
	Usuario,
	Producto,
	Carrito,
	CarritoProducto,
	Pedido,
	DetallePedido,
};
