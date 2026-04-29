import api from "./api";

const pagoService = {
	async getMetodos() {
		const { data } = await api.get("/pagos/metodos");
		return data.data;
	},

	async procesarPago(payload) {
		const { data } = await api.post("/pagos/procesar", payload);
		return data.data;
	},

	async getMisTransacciones() {
		const { data } = await api.get("/pagos/mis-transacciones");
		return data.data;
	},

	async getTodasTransacciones(filters = {}) {
		const params = {};
		if (filters.fechaDesde) params.fechaDesde = filters.fechaDesde;
		if (filters.fechaHasta) params.fechaHasta = filters.fechaHasta;
		if (filters.estado) params.estado = filters.estado;
		if (filters.metodoPagoId) params.metodoPagoId = filters.metodoPagoId;
		const { data } = await api.get("/pagos/transacciones", { params });
		return data.data;
	},

	async getTransaccion(codigo) {
		const { data } = await api.get(`/pagos/transacciones/${codigo}`);
		return data.data;
	},
};

export default pagoService;
