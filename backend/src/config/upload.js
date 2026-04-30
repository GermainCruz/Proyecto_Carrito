const path = require("path");
const multer = require("multer");
const fs = require("fs");

const PRODUCTOS_ASSETS_DIR = path.join(__dirname, "..", "..", "uploads");

if (!fs.existsSync(PRODUCTOS_ASSETS_DIR)) {
	fs.mkdirSync(PRODUCTOS_ASSETS_DIR, { recursive: true });
}

function sanitizeFilename(nombre) {
	return nombre
		.replace(/\s+/g, "_")
		.replace(/[<>:"/\\|?*]/g, "")
		.replace(/_+/g, "_")
		.replace(/^_|_$/g, "");
}

const storage = multer.diskStorage({
	destination: (_req, _file, cb) => {
		cb(null, PRODUCTOS_ASSETS_DIR);
	},
	filename: (req, file, cb) => {
		const nombre = req.body?.nombre || "producto";
		const ext = path.extname(file.originalname).toLowerCase();
		const baseName = sanitizeFilename(nombre);
		// Nombre determinístico: evita generar archivos duplicados con sufijos.
		cb(null, `${baseName}${ext}`);
	},
});

const fileFilter = (_req, file, cb) => {
	const allowed = ["image/jpeg", "image/png", "image/webp", "image/gif"];
	if (allowed.includes(file.mimetype)) {
		cb(null, true);
	} else {
		cb(new Error("Solo se permiten imágenes (jpg, png, webp, gif)"), false);
	}
};

const upload = multer({
	storage,
	fileFilter,
	limits: { fileSize: 5 * 1024 * 1024 },
});

module.exports = { upload, sanitizeFilename, PRODUCTOS_ASSETS_DIR };
