-- ============================================
-- TABLA: usuarios
-- ============================================
CREATE TABLE usuarios (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    correo_electronico VARCHAR(100) UNIQUE NOT NULL,
    contrasena TEXT NOT NULL, -- almacenar hash con bcrypt
    rol VARCHAR(20) NOT NULL CHECK (rol IN ('admin', 'gestor', 'cliente')),
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    activo BOOLEAN DEFAULT TRUE
);

COMMENT ON TABLE usuarios IS 'Almacena todos los usuarios del sistema (clientes, gestores, administradores)';
COMMENT ON COLUMN usuarios.rol IS 'Rol del usuario: admin, gestor o cliente';

-- ============================================
-- TABLA: productos
-- ============================================
CREATE TABLE productos (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(150) NOT NULL,
    descripcion TEXT,
    precio DECIMAL(10,2) NOT NULL CHECK (precio >= 0),
    stock INT NOT NULL DEFAULT 0 CHECK (stock >= 0),
    categoria VARCHAR(50),
    imagen_url TEXT,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE productos IS 'Catálogo de productos disponibles para la venta';

-- ============================================
-- TABLA: carrito (carrito de compras activo por usuario)
-- ============================================
CREATE TABLE carrito (
    id SERIAL PRIMARY KEY,
    usuario_id INT NOT NULL UNIQUE, -- un usuario solo puede tener un carrito activo
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
);

COMMENT ON TABLE carrito IS 'Carrito de compras activo para cada usuario';

-- Índice para búsquedas rápidas por usuario
CREATE INDEX idx_carrito_usuario ON carrito(usuario_id);

-- ============================================
-- TABLA: carrito_productos (ítems dentro del carrito)
-- ============================================
CREATE TABLE carrito_productos (
    id SERIAL PRIMARY KEY,
    carrito_id INT NOT NULL,
    producto_id INT NOT NULL,
    cantidad INT NOT NULL CHECK (cantidad > 0),
    precio_unitario DECIMAL(10,2) NOT NULL CHECK (precio_unitario >= 0),
    FOREIGN KEY (carrito_id) REFERENCES carrito(id) ON DELETE CASCADE,
    FOREIGN KEY (producto_id) REFERENCES productos(id) ON DELETE RESTRICT,
    UNIQUE(carrito_id, producto_id) -- Evita duplicados del mismo producto en un carrito
);

COMMENT ON TABLE carrito_productos IS 'Productos agregados al carrito con la cantidad y el precio en el momento de la adición';

-- Índices para carrito_productos
CREATE INDEX idx_carrito_productos_carrito ON carrito_productos(carrito_id);
CREATE INDEX idx_carrito_productos_producto ON carrito_productos(producto_id);

-- ============================================
-- TABLA: pedidos (una vez finalizada la compra)
-- ============================================
CREATE TABLE pedidos (
    id SERIAL PRIMARY KEY,
    usuario_id INT NOT NULL,
    fecha_pedido TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    estado VARCHAR(20) NOT NULL DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'pagado', 'enviado', 'entregado', 'cancelado')),
    total DECIMAL(12,2) NOT NULL CHECK (total >= 0),
    metodo_pago_simulado VARCHAR(50),
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE RESTRICT
);

COMMENT ON TABLE pedidos IS 'Pedidos finalizados por los usuarios';

CREATE INDEX idx_pedidos_usuario ON pedidos(usuario_id);
CREATE INDEX idx_pedidos_fecha ON pedidos(fecha_pedido);
CREATE INDEX idx_pedidos_estado ON pedidos(estado);

-- ============================================
-- TABLA: detalle_pedidos (ítems de cada pedido)
-- ============================================
CREATE TABLE detalle_pedidos (
    id SERIAL PRIMARY KEY,
    pedido_id INT NOT NULL,
    producto_id INT NOT NULL,
    cantidad INT NOT NULL CHECK (cantidad > 0),
    precio_unitario DECIMAL(10,2) NOT NULL CHECK (precio_unitario >= 0),
    subtotal DECIMAL(12,2) NOT NULL CHECK (subtotal >= 0),
    FOREIGN KEY (pedido_id) REFERENCES pedidos(id) ON DELETE CASCADE,
    FOREIGN KEY (producto_id) REFERENCES productos(id) ON DELETE RESTRICT
);

COMMENT ON TABLE detalle_pedidos IS 'Detalle de productos comprados en cada pedido';

CREATE INDEX idx_detalle_pedidos_pedido ON detalle_pedidos(pedido_id);
CREATE INDEX idx_detalle_pedidos_producto ON detalle_pedidos(producto_id);

-- ============================================
-- (OPCIONAL) ÍNDICE ADICIONAL PARA REPORTES DE TIEMPO
-- ============================================
CREATE INDEX idx_pedidos_fecha_estado ON pedidos(fecha_pedido, estado);