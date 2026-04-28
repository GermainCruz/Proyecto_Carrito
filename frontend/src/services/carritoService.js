import api from "./api";

const carritoService = {
	async getMyCart() {
		const { data } = await api.get("/carrito");
		return data.data;
	},
	async addItem(payload) {
		const { data } = await api.post("/carrito/items", payload);
		return data.data;
	},
	async updateItem(productoId, payload) {
		const { data } = await api.patch(`/carrito/items/${productoId}`, payload);
		return data.data;
	},
	async removeItem(productoId) {
		const { data } = await api.delete(`/carrito/items/${productoId}`);
		return data.data;
	},
	async checkout(payload) {
		const { data } = await api.post("/pedidos/checkout", payload);
		return data.data;
	},
	async getMisPedidos() {
		const { data } = await api.get("/pedidos/mis");
		return data.data;
	},
	async getDashboardKpis() {
		const { data } = await api.get("/dashboard/kpis");
		return data.data;
	},
	async getVentasDiarias() {
		const { data } = await api.get("/dashboard/ventas-diarias");
		return data.data;
	},
	async getCategorias() {
		const { data } = await api.get("/dashboard/categorias");
		return data.data;
	},
	async getEstadisticas() {
		const { data } = await api.get("/dashboard/estadisticas-descriptivas");
		return data.data;
	},
	async getEstadosPedidos() {
		const { data } = await api.get("/dashboard/estados-pedidos");
		return data.data;
	},
	async getTopProductosDashboard() {
		const { data } = await api.get("/dashboard/top-productos");
		return data.data;
	},
};

export default carritoService;
