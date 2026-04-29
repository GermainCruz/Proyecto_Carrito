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
    UNIQUE(carrito_id, producto_id)
);

COMMENT ON TABLE carrito_productos IS 'Productos agregados al carrito con la cantidad y el precio en el momento de la adición';

CREATE INDEX idx_carrito_productos_carrito ON carrito_productos(carrito_id);
CREATE INDEX idx_carrito_productos_producto ON carrito_productos(producto_id);

-- ============================================
-- TABLA: metodos_pago (catálogo de métodos aceptados por la pasarela)
-- ============================================
CREATE TABLE metodos_pago (
    id SERIAL PRIMARY KEY,
    codigo VARCHAR(30) UNIQUE NOT NULL,
    nombre VARCHAR(50) NOT NULL,
    tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('tarjeta', 'billetera', 'transferencia')),
    requiere_tarjeta BOOLEAN NOT NULL DEFAULT FALSE,
    comision_porcentaje DECIMAL(5,2) NOT NULL DEFAULT 0 CHECK (comision_porcentaje >= 0),
    activo BOOLEAN DEFAULT TRUE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE metodos_pago IS 'Catálogo de métodos de pago habilitados en la pasarela (Visa, Mastercard, Yape, Plin, etc.)';
COMMENT ON COLUMN metodos_pago.tipo IS 'Categoría del medio de pago: tarjeta, billetera o transferencia';
COMMENT ON COLUMN metodos_pago.requiere_tarjeta IS 'Indica si requiere capturar datos de tarjeta (titular, número, vencimiento, CVV)';
COMMENT ON COLUMN metodos_pago.comision_porcentaje IS 'Porcentaje de comisión que cobra la pasarela por cada transacción';

CREATE INDEX idx_metodos_pago_activo ON metodos_pago(activo);

-- ============================================
-- TABLA: pedidos (una vez finalizada la compra)
-- ============================================
CREATE TABLE pedidos (
    id SERIAL PRIMARY KEY,
    usuario_id INT NOT NULL,
    fecha_pedido TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    estado VARCHAR(20) NOT NULL DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'pagado', 'enviado', 'entregado', 'cancelado')),
    total DECIMAL(12,2) NOT NULL CHECK (total >= 0),
    metodo_pago_id INT NOT NULL,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE RESTRICT,
    FOREIGN KEY (metodo_pago_id) REFERENCES metodos_pago(id) ON DELETE RESTRICT
);

COMMENT ON TABLE pedidos IS 'Pedidos finalizados por los usuarios. Cada pedido es resultado de una transacción aprobada en la pasarela.';
COMMENT ON COLUMN pedidos.metodo_pago_id IS 'Referencia al método de pago usado (FK a metodos_pago)';

CREATE INDEX idx_pedidos_usuario ON pedidos(usuario_id);
CREATE INDEX idx_pedidos_fecha ON pedidos(fecha_pedido);
CREATE INDEX idx_pedidos_estado ON pedidos(estado);
CREATE INDEX idx_pedidos_metodo_pago ON pedidos(metodo_pago_id);
CREATE INDEX idx_pedidos_fecha_estado ON pedidos(fecha_pedido, estado);

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
-- TABLA: transacciones_pago (registro de cada intento de pago en la pasarela)
-- ============================================
CREATE TABLE transacciones_pago (
    id SERIAL PRIMARY KEY,
    codigo_transaccion VARCHAR(40) UNIQUE NOT NULL,
    usuario_id INT NOT NULL,
    metodo_pago_id INT NOT NULL,
    pedido_id INT NULL, -- nullable: las transacciones rechazadas no generan pedido
    monto DECIMAL(12,2) NOT NULL CHECK (monto >= 0),
    moneda VARCHAR(3) NOT NULL DEFAULT 'PEN',
    estado VARCHAR(20) NOT NULL DEFAULT 'iniciada'
        CHECK (estado IN ('iniciada', 'procesando', 'aprobada', 'rechazada', 'reembolsada')),
    -- Datos enmascarados de tarjeta (NUNCA se almacena PAN completo ni CVV)
    tarjeta_titular VARCHAR(100),
    tarjeta_ultimos_4 VARCHAR(4),
    tarjeta_marca VARCHAR(20),
    -- Datos para billetera digital (Yape/Plin)
    telefono_billetera VARCHAR(20),
    -- Trazabilidad de la pasarela
    codigo_autorizacion VARCHAR(30),
    referencia_externa VARCHAR(50),
    motivo_rechazo VARCHAR(255),
    -- Timestamps
    fecha_iniciada TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_procesada TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE RESTRICT,
    FOREIGN KEY (metodo_pago_id) REFERENCES metodos_pago(id) ON DELETE RESTRICT,
    FOREIGN KEY (pedido_id) REFERENCES pedidos(id) ON DELETE SET NULL
);

COMMENT ON TABLE transacciones_pago IS 'Bitácora completa de cada intento de pago procesado por la pasarela (aprobados, rechazados y reembolsados)';
COMMENT ON COLUMN transacciones_pago.codigo_transaccion IS 'Identificador único público de la transacción (formato TXN-YYYYMMDD-XXXXXXXX)';
COMMENT ON COLUMN transacciones_pago.estado IS 'Estado del intento de pago: iniciada, procesando, aprobada, rechazada o reembolsada';
COMMENT ON COLUMN transacciones_pago.tarjeta_ultimos_4 IS 'Últimos 4 dígitos del PAN (los demás se enmascaran por seguridad PCI-DSS)';
COMMENT ON COLUMN transacciones_pago.codigo_autorizacion IS 'Código de autorización devuelto por la pasarela cuando la transacción es aprobada';
COMMENT ON COLUMN transacciones_pago.motivo_rechazo IS 'Mensaje devuelto por la pasarela cuando la transacción es rechazada';

CREATE INDEX idx_transacciones_pago_usuario ON transacciones_pago(usuario_id);
CREATE INDEX idx_transacciones_pago_pedido ON transacciones_pago(pedido_id);
CREATE INDEX idx_transacciones_pago_metodo ON transacciones_pago(metodo_pago_id);
CREATE INDEX idx_transacciones_pago_estado ON transacciones_pago(estado);
CREATE INDEX idx_transacciones_pago_fecha ON transacciones_pago(fecha_iniciada);
CREATE INDEX idx_transacciones_pago_codigo ON transacciones_pago(codigo_transaccion);
