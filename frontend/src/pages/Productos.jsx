import { useEffect, useRef, useState } from "react";

import Boton from "../components/common/Boton";
import Input from "../components/common/Input";
import Modal from "../components/common/Modal";
import { useAuth } from "../hooks/useAuth";
import { useCarrito } from "../hooks/useCarrito";
import api from "../services/api";
import { money } from "../utils/formateadores";

const localProductImages = import.meta.glob("../assets/productos/*", { eager: true, import: "default" });

function resolveProductImage(imagenUrl) {
	if (!imagenUrl) return null;

	if (imagenUrl.startsWith("http://") || imagenUrl.startsWith("https://") || imagenUrl.startsWith("/")) {
		return imagenUrl;
	}

	const normalized = imagenUrl.replaceAll("\\", "/");
	const fileName = normalized.split("/").pop();
	if (!fileName) return null;

	const directAsset = localProductImages[`../assets/productos/${fileName}`];
	if (directAsset) return directAsset;

	if (normalized.startsWith("frontend/src/assets/")) {
		return normalized.replace("frontend/src/assets", "/src/assets");
	}

	return normalized;
}


const priceRangeOptions = [
	{ label: "Todos", value: "" },
	{ label: "Menor a S/ 100", value: "0-100" },
	{ label: "S/ 100 a S/ 300", value: "100-300" },
	{ label: "S/ 300 a S/ 700", value: "300-700" },
	{ label: "Mayor a S/ 700", value: "700-999999" },
];

const stockRangeOptions = [
	{ label: "Todos", value: "" },
	{ label: "Disponible", value: "1" },
	{ label: "Stock medio (+10)", value: "10" },
	{ label: "Stock alto (+30)", value: "30" },
];

const initialForm = {
	nombre: "",
	descripcion: "",
	precio: 0,
	stock: 0,
	categoria: "",
	imagen_url: "",
};

function EyeIcon() {
	return (
		<svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
			<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" strokeLinecap="round" strokeLinejoin="round" />
			<circle cx="12" cy="12" r="3" strokeLinecap="round" strokeLinejoin="round" />
		</svg>
	);
}

function EyeOffIcon() {
	return (
		<svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
			<path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" strokeLinecap="round" strokeLinejoin="round" />
			<line strokeLinecap="round" strokeLinejoin="round" x1="1" x2="23" y1="1" y2="23" />
		</svg>
	);
}

export default function Productos() {
	const [productos, setProductos] = useState([]);
	const [categorias, setCategorias] = useState([]);
	const [filters, setFilters] = useState({
		q: "",
		categoria: "",
		priceRange: "",
		stockRange: "",
	});
	const [openModal, setOpenModal] = useState(false);
	const [modalMode, setModalMode] = useState("create");
	const [selectedProductId, setSelectedProductId] = useState(null);
	const [form, setForm] = useState(initialForm);
	const [error, setError] = useState("");
	const [selectedFile, setSelectedFile] = useState(null);
	const [previewUrl, setPreviewUrl] = useState(null);
	const [showPreview, setShowPreview] = useState(false);
	const fileInputRef = useRef(null);
	const { user } = useAuth();
	const { addItem } = useCarrito();

	const canManage = user && ["admin", "gestor"].includes(user.rol);

	const fetchCategorias = async () => {
		try {
			const { data } = await api.get("/productos/categorias");
			setCategorias(data.data || []);
		} catch {
			// si falla, no bloquea el resto de la página
		}
	};

	const fetchProductos = async () => {
		const [minPrecio, maxPrecio] = filters.priceRange ? filters.priceRange.split("-") : [undefined, undefined];
		const params = {
			q: filters.q || undefined,
			categoria: filters.categoria || undefined,
			minPrecio: minPrecio || undefined,
			maxPrecio: maxPrecio || undefined,
			stockMin: filters.stockRange || undefined,
		};
		const { data } = await api.get("/productos", { params });
		setProductos(data.data || []);
	};

	useEffect(() => {
		fetchCategorias();
	}, []);

	useEffect(() => {
		fetchProductos();
	}, [filters]);

	useEffect(() => {
		const handleInventoryUpdate = () => {
			fetchProductos();
			fetchCategorias();
		};

		window.addEventListener("inventory:updated", handleInventoryUpdate);
		return () => window.removeEventListener("inventory:updated", handleInventoryUpdate);
	}, [filters]);

	const onSubmitProduct = async (e) => {
		e.preventDefault();
		setError("");
		try {
			let finalImagenUrl = form.imagen_url;

			if (selectedFile) {
				const formData = new FormData();
				formData.append("imagen", selectedFile);
				formData.append("nombre", form.nombre);
				const { data } = await api.post("/productos/upload-imagen", formData, {
					headers: { "Content-Type": "multipart/form-data" },
				});
				finalImagenUrl = data.imagen_url;
			}

			const payload = { ...form, imagen_url: finalImagenUrl };

			if (modalMode === "edit" && selectedProductId) {
				await api.put(`/productos/${selectedProductId}`, payload);
			} else {
				await api.post("/productos", payload);
			}
			closeModal();
			await fetchProductos();
			await fetchCategorias();
		} catch (err) {
			setError(err.response?.data?.message || "No se pudo guardar");
		}
	};

	const closeModal = () => {
		setOpenModal(false);
		setForm(initialForm);
		setSelectedProductId(null);
		setSelectedFile(null);
		setPreviewUrl(null);
		setShowPreview(false);
		setError("");
	};

	const onFileChange = (e) => {
		const file = e.target.files?.[0];
		if (!file) return;
		setSelectedFile(file);
		const url = URL.createObjectURL(file);
		setPreviewUrl(url);
		setShowPreview(true);
	};

	const onClickCreate = () => {
		setModalMode("create");
		setSelectedProductId(null);
		setForm(initialForm);
		setSelectedFile(null);
		setPreviewUrl(null);
		setShowPreview(false);
		setError("");
		setOpenModal(true);
	};

	const onClickEdit = (producto) => {
		setModalMode("edit");
		setSelectedProductId(producto.id);
		setForm({
			nombre: producto.nombre || "",
			descripcion: producto.descripcion || "",
			precio: Number(producto.precio || 0),
			stock: Number(producto.stock || 0),
			categoria: producto.categoria || "",
			imagen_url: producto.imagen_url || "",
		});
		setSelectedFile(null);
		setPreviewUrl(resolveProductImage(producto.imagen_url));
		setShowPreview(false);
		setError("");
		setOpenModal(true);
	};

	const onClickDelete = async (producto) => {
		const confirmed = window.confirm(`Eliminar producto "${producto.nombre}"?`);
		if (!confirmed) return;

		try {
			await api.delete(`/productos/${producto.id}`);
			await fetchProductos();
		} catch (err) {
			setError(err.response?.data?.message || "No se pudo eliminar");
		}
	};

	const clearFilters = async () => {
		setFilters({ q: "", categoria: "", priceRange: "", stockRange: "" });
		const { data } = await api.get("/productos");
		setProductos(data.data || []);
	};

	return (
		<section className="space-y-4">
			<div className="rounded-xl border border-sky-100 bg-gradient-to-br from-white to-sky-50 p-4 shadow-lg">
				<div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
					<Input
						label="Buscar"
						placeholder="Ej. silla, mouse, monitor..."
						value={filters.q}
						onChange={(e) => setFilters((f) => ({ ...f, q: e.target.value }))}
					/>
				<label className="block text-sm font-medium text-slate-700">
					Categoría
					<select
						className="mt-1 w-full rounded-lg border border-sky-200 bg-white px-3 py-2"
						value={filters.categoria}
						onChange={(e) => setFilters((f) => ({ ...f, categoria: e.target.value }))}
					>
						<option value="">Todas</option>
						{categorias.map((cat) => (
							<option key={cat} value={cat}>
								{cat}
							</option>
						))}
					</select>
				</label>
					<label className="block text-sm font-medium text-slate-700">
						Rango de precio
						<select
							className="mt-1 w-full rounded-lg border border-sky-200 bg-white px-3 py-2"
							value={filters.priceRange}
							onChange={(e) => setFilters((f) => ({ ...f, priceRange: e.target.value }))}
						>
							{priceRangeOptions.map((option) => (
								<option key={option.value || "all-price"} value={option.value}>
									{option.label}
								</option>
							))}
						</select>
					</label>
					<label className="block text-sm font-medium text-slate-700">
						Stock mínimo
						<select
							className="mt-1 w-full rounded-lg border border-sky-200 bg-white px-3 py-2"
							value={filters.stockRange}
							onChange={(e) => setFilters((f) => ({ ...f, stockRange: e.target.value }))}
						>
							{stockRangeOptions.map((option) => (
								<option key={option.value || "all-stock"} value={option.value}>
									{option.label}
								</option>
							))}
						</select>
					</label>
				</div>

				<div className="mt-3 flex flex-wrap gap-2">
					<Boton className="bg-slate-600 hover:bg-slate-500" onClick={clearFilters} type="button">
						Limpiar
					</Boton>
					{canManage ? (
						<Boton className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500" onClick={onClickCreate} type="button">
							Nuevo producto
						</Boton>
					) : null}
				</div>
			</div>

			{error ? <p className="text-sm text-rose-700">{error}</p> : null}

			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
				{productos.map((producto) => (
					<article className="rounded-xl border border-slate-200 bg-white p-4 shadow-md transition hover:-translate-y-1 hover:shadow-xl" key={producto.id}>
						{resolveProductImage(producto.imagen_url) ? (
							<div className="mb-3 flex h-48 w-full items-center justify-center rounded-lg bg-slate-50 p-2 overflow-hidden">
								<img
									alt={producto.nombre}
									className="h-full w-full object-contain transition-transform duration-300 hover:scale-105"
									src={resolveProductImage(producto.imagen_url)}
								/>
							</div>
						) : (
							<div className="mb-3 flex h-48 w-full items-center justify-center rounded-lg bg-slate-100 text-sm text-slate-500">
								Sin imagen
							</div>
						)}
						<p className="text-xs uppercase tracking-wide text-slate-500">{producto.categoria || "General"}</p>
						<h3 className="text-lg font-bold">{producto.nombre}</h3>
						<p className="line-clamp-2 text-sm text-slate-600">{producto.descripcion || "Sin descripcion"}</p>
						<p className="mt-3 font-semibold">{money(producto.precio)}</p>
						<p className={`text-sm font-semibold ${producto.stock === 10 || producto.stock <= 5 ? "text-rose-700" : "text-emerald-700"}`}>
							Stock: {producto.stock}
						</p>
						<div className="mt-3 flex gap-2">
							<Boton className="bg-sky-700 hover:bg-sky-600" disabled={producto.stock <= 0} onClick={() => addItem(producto.id, 1)} type="button">
								Agregar al carrito
							</Boton>
							{canManage ? (
								<>
									<Boton className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400" onClick={() => onClickEdit(producto)} type="button">
										Editar
									</Boton>
									<Boton className="bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500" onClick={() => onClickDelete(producto)} type="button">
										Eliminar
									</Boton>
								</>
							) : null}
						</div>
					</article>
				))}
			</div>

		<Modal onClose={closeModal} open={openModal} title={modalMode === "edit" ? "Editar producto" : "Nuevo producto"}>
			<form className="space-y-3" onSubmit={onSubmitProduct}>
				<Input label="Nombre" value={form.nombre} onChange={(e) => setForm((f) => ({ ...f, nombre: e.target.value }))} />
				<Input
					label="Descripcion"
					value={form.descripcion}
					onChange={(e) => setForm((f) => ({ ...f, descripcion: e.target.value }))}
				/>
				<Input
					label="Precio"
					min={0}
					step="0.01"
					type="number"
					value={form.precio}
					onChange={(e) => setForm((f) => ({ ...f, precio: Number(e.target.value) }))}
				/>
				<Input
					label="Stock"
					min={0}
					max={100}
					type="number"
					value={form.stock}
					onChange={(e) => setForm((f) => ({ ...f, stock: Number(e.target.value) }))}
				/>
				{Number(form.stock) > 100 ? <p className="text-sm text-rose-700">El stock maximo permitido es 100.</p> : null}
				<Input
					label="Categoria"
					value={form.categoria}
					onChange={(e) => setForm((f) => ({ ...f, categoria: e.target.value }))}
				/>

				<div>
					<p className="mb-1 text-sm font-medium text-slate-700">Imagen del producto</p>
					<div className="flex items-center gap-2">
						<button
							className="flex-1 rounded-lg border border-dashed border-sky-300 bg-sky-50 px-3 py-2 text-left text-sm text-slate-600 transition hover:border-sky-500 hover:bg-sky-100"
							onClick={() => fileInputRef.current?.click()}
							type="button"
						>
							{selectedFile ? (
								<span className="font-medium text-sky-700">{selectedFile.name}</span>
							) : form.imagen_url ? (
								<span className="text-slate-500 truncate block">{form.imagen_url.split("/").pop()}</span>
							) : (
								<span className="text-slate-400">Haz clic para seleccionar imagen...</span>
							)}
						</button>
						{previewUrl ? (
							<button
								className={`rounded-lg border p-2 transition ${showPreview ? "border-sky-500 bg-sky-100 text-sky-700" : "border-slate-200 bg-white text-slate-500 hover:border-sky-300 hover:text-sky-600"}`}
								onClick={() => setShowPreview((v) => !v)}
								title={showPreview ? "Ocultar previsualización" : "Ver previsualización"}
								type="button"
							>
								{showPreview ? <EyeOffIcon /> : <EyeIcon />}
							</button>
						) : null}
						<input
							accept="image/*"
							className="hidden"
							onChange={onFileChange}
							ref={fileInputRef}
							type="file"
						/>
					</div>
					{showPreview && previewUrl ? (
						<div className="mt-2 flex justify-center rounded-lg border border-sky-100 bg-slate-50 p-2">
							<img
								alt="Previsualización"
								className="max-h-40 rounded object-contain"
								src={previewUrl}
							/>
						</div>
					) : null}
				</div>

				{error ? <p className="text-sm text-rose-700">{error}</p> : null}
				<Boton className="bg-gradient-to-r from-slate-900 to-sky-700 hover:from-slate-800 hover:to-sky-600" type="submit">
					{modalMode === "edit" ? "Guardar cambios" : "Guardar"}
				</Boton>
			</form>
		</Modal>
		</section>
	);
}
