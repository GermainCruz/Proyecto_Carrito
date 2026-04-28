BEGIN;

-- ============================================
-- TABLA: usuarios
-- ============================================
INSERT INTO usuarios (id, nombre, correo_electronico, contrasena, rol, fecha_registro, activo)
VALUES
    (1, 'Administrador Demo', 'admin@demo.com', '0ab27272ccab4f6a408471c6e6fdd5c7:35396853d212215dc61b36e143514c37d25c1cc601e0836206a179a0d41d5343e4a12d20d4cabbdeaa1ca214fb99ef182b74497c638066aa56912ae47fc84ae0', 'admin', '2026-04-01 08:00:00', true),
    (2, 'Gestor Demo', 'gestor@demo.com', 'e8a23579c0461669f70f279512f5c230:aedddda29d3508a2832f6a3a69ccd4fb5f12e68924947c01fbddd4153c02d919c042036ce4296208f36108a74d2560dabbb982e1ffb3128d4d5ea3b105136b7f', 'gestor', '2026-04-02 09:00:00', true),
    (3, 'Cliente Demo 1', 'cliente@demo.com', '63fdbc783e373c6c8bff20d5a745cb99:2ea837833f50b9461d07371548315b306978790adf2019ac60421a5c71c4ea5eeac175e3c60c2dfa9707b78c6c2d6a4a325b13b44bc563d17cdb7fa9b18afda8', 'cliente', '2026-04-03 10:00:00', true),
    (4, 'Cliente Demo 2', 'cliente2@demo.com', '63fdbc783e373c6c8bff20d5a745cb99:2ea837833f50b9461d07371548315b306978790adf2019ac60421a5c71c4ea5eeac175e3c60c2dfa9707b78c6c2d6a4a325b13b44bc563d17cdb7fa9b18afda8', 'cliente', '2026-04-04 11:00:00', true),
    (5, 'Cliente Demo 3', 'cliente3@demo.com', '63fdbc783e373c6c8bff20d5a745cb99:2ea837833f50b9461d07371548315b306978790adf2019ac60421a5c71c4ea5eeac175e3c60c2dfa9707b78c6c2d6a4a325b13b44bc563d17cdb7fa9b18afda8', 'cliente', '2026-04-05 12:00:00', true)
ON CONFLICT (correo_electronico) DO NOTHING;

-- ============================================
-- TABLA: productos
-- ============================================
INSERT INTO productos (id, nombre, descripcion, precio, stock, categoria, imagen_url, fecha_creacion)
VALUES
    (1, 'Mouse Inalambrico', 'Mouse ergonomico recargable', 79.90, 45, 'Perifericos', null, '2026-04-01 09:15:00'),
    (2, 'Teclado Mecanico', 'Teclado switch red para gaming y oficina', 189.00, 30, 'Perifericos', null, '2026-04-01 09:20:00'),
    (3, 'Monitor 24 pulgadas', 'Panel IPS Full HD 75Hz', 649.00, 20, 'Monitores', null, '2026-04-01 09:25:00'),
    (4, 'SSD NVMe 1TB', 'Unidad estado solido PCIe 4.0', 329.00, 25, 'Almacenamiento', null, '2026-04-01 09:30:00'),
    (5, 'Audifonos Bluetooth', 'Cancelacion de ruido basica', 149.00, 40, 'Audio', null, '2026-04-01 09:35:00'),
    (6, 'Webcam HD', 'Camara para videollamadas Full HD', 129.00, 18, 'Accesorios', null, '2026-04-01 09:40:00'),
    (7, 'Silla Ergonomica', 'Silla ajustable para oficina', 899.00, 12, 'Oficina', null, '2026-04-01 09:45:00'),
    (8, 'Adaptador USB-C', 'Adaptador multipuerto 5 en 1', 59.90, 60, 'Accesorios', null, '2026-04-01 09:50:00')
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- TABLA: carrito
-- ============================================
INSERT INTO carrito (id, usuario_id, fecha_creacion, fecha_actualizacion)
VALUES
    (1, 3, '2026-04-20 10:00:00', '2026-04-20 10:05:00'),
    (2, 4, '2026-04-20 11:00:00', '2026-04-20 11:10:00'),
    (3, 5, '2026-04-20 12:00:00', '2026-04-20 12:10:00')
ON CONFLICT (usuario_id) DO NOTHING;

-- ============================================
-- TABLA: carrito_productos
-- ============================================
INSERT INTO carrito_productos (id, carrito_id, producto_id, cantidad, precio_unitario)
VALUES
    (1, 1, 1, 2, 79.90),
    (2, 1, 8, 3, 59.90),
    (3, 2, 3, 1, 649.00),
    (4, 2, 5, 1, 149.00),
    (5, 2, 6, 2, 129.00),
    (6, 3, 2, 1, 189.00),
    (7, 3, 4, 1, 329.00),
    (8, 3, 8, 2, 59.90)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- TABLA: pedidos
-- ============================================
INSERT INTO pedidos (id, usuario_id, fecha_pedido, estado, total, metodo_pago_simulado, fecha_creacion)
VALUES
    (1, 3, '2026-04-15 09:15:00', 'entregado', 299.60, 'tarjeta_simulada', '2026-04-15 09:16:00'),
    (2, 3, '2026-04-16 14:20:00', 'enviado', 378.00, 'yape_simulado', '2026-04-16 14:21:00'),
    (3, 4, '2026-04-16 18:10:00', 'pagado', 798.00, 'plin_simulado', '2026-04-16 18:11:00'),
    (4, 5, '2026-04-17 08:45:00', 'entregado', 448.80, 'tarjeta_simulada', '2026-04-17 08:46:00'),
    (5, 4, '2026-04-18 19:30:00', 'cancelado', 258.00, 'yape_simulado', '2026-04-18 19:31:00'),
    (6, 3, '2026-04-19 12:05:00', 'pagado', 958.90, 'tarjeta_simulada', '2026-04-19 12:06:00'),
    (7, 5, '2026-04-20 16:40:00', 'enviado', 268.90, 'plin_simulado', '2026-04-20 16:41:00'),
    (8, 4, '2026-04-21 10:25:00', 'pendiente', 1298.00, 'tarjeta_simulada', '2026-04-21 10:26:00')
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- TABLA: detalle_pedidos
-- ============================================
INSERT INTO detalle_pedidos (id, pedido_id, producto_id, cantidad, precio_unitario, subtotal)
VALUES
    (1, 1, 1, 3, 79.90, 239.70),
    (2, 1, 8, 1, 59.90, 59.90),
    (3, 2, 2, 2, 189.00, 378.00),
    (4, 3, 3, 1, 649.00, 649.00),
    (5, 3, 5, 1, 149.00, 149.00),
    (6, 4, 4, 1, 329.00, 329.00),
    (7, 4, 8, 2, 59.90, 119.80),
    (8, 5, 6, 2, 129.00, 258.00),
    (9, 6, 7, 1, 899.00, 899.00),
    (10, 6, 8, 1, 59.90, 59.90),
    (11, 7, 2, 1, 189.00, 189.00),
    (12, 7, 1, 1, 79.90, 79.90),
    (13, 8, 3, 2, 649.00, 1298.00)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- AJUSTE DE SECUENCIAS
-- ============================================
SELECT setval(pg_get_serial_sequence('usuarios', 'id'), COALESCE((SELECT MAX(id) FROM usuarios), 1), true);
SELECT setval(pg_get_serial_sequence('productos', 'id'), COALESCE((SELECT MAX(id) FROM productos), 1), true);
SELECT setval(pg_get_serial_sequence('carrito', 'id'), COALESCE((SELECT MAX(id) FROM carrito), 1), true);
SELECT setval(pg_get_serial_sequence('carrito_productos', 'id'), COALESCE((SELECT MAX(id) FROM carrito_productos), 1), true);
SELECT setval(pg_get_serial_sequence('pedidos', 'id'), COALESCE((SELECT MAX(id) FROM pedidos), 1), true);
SELECT setval(pg_get_serial_sequence('detalle_pedidos', 'id'), COALESCE((SELECT MAX(id) FROM detalle_pedidos), 1), true);

COMMIT;
