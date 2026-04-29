# Manual de Instalación

## 1. Requisitos previos
- Node.js 18 o superior.
- PostgreSQL 16 o superior.
- Navegador moderno.
- Git, si vas a clonar el repositorio.

## 2. Estructura general
El proyecto contiene dos aplicaciones:
- `backend`: API y lógica de negocio.
- `frontend`: aplicación React.

## 3. Base de datos
1. Crea una base de datos llamada `carrito_compras`.
2. Ejecuta el script de estructura:
   - `sql/create_database.sql`
3. Carga los datos de prueba:
   - `sql/datos.sql`

## 4. Variables de entorno
Crea el archivo de entorno del backend con estos valores:

```env
# Host del servidor PostgreSQL
DB_HOST=localhost

# Puerto del servidor PostgreSQL
DB_PORT=5432

# Nombre de la base de datos del proyecto
DB_NAME=carrito_compras

# Usuario de PostgreSQL
DB_USER=postgres

# Contraseña de PostgreSQL
DB_PASSWORD=sa
```

## 5. Instalación del backend
1. Abre una terminal en la carpeta `backend`.
2. Instala dependencias:
   ```bash
   npm install
   ```
3. Inicia el servidor en modo desarrollo:
   ```bash
   npm run dev
   ```
4. Verifica la API en:
   - `http://localhost:4000/api/health`

## 6. Instalación del frontend
1. Abre otra terminal en la carpeta `frontend`.
2. Instala dependencias:
   ```bash
   npm install
   ```
3. Inicia el frontend:
   ```bash
   npm run dev
   ```
4. Abre la aplicación en el navegador desde la URL que indique Vite.

## 7. Puesta en marcha recomendada
1. Levanta PostgreSQL.
2. Crea y carga la base de datos.
3. Inicia el backend.
4. Inicia el frontend.
5. Accede con un usuario válido y prueba el flujo de productos, carrito y pasarela de pagos.

## 8. Verificación rápida
- La API debe responder en el endpoint de salud.
- El login debe mostrar el formulario inicial.
- El catálogo debe cargar productos.
- La pasarela de pagos debe permitir seleccionar método y procesar la compra.

## 9. Solución de problemas comunes
- Si el backend no inicia, verifica que el puerto 4000 esté libre.
- Si la aplicación no conecta, revisa las variables de entorno y la base de datos.
- Si no cargan productos o pagos, confirma que los scripts SQL fueron ejecutados correctamente.
