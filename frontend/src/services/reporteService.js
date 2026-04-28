import api from "./api";

function downloadBlob(blob, filename) {
	const url = window.URL.createObjectURL(blob);
	const link = document.createElement("a");
	link.href = url;
	link.download = filename;
	link.click();
	link.remove();
	window.URL.revokeObjectURL(url);
}

const reporteService = {
	async descargarOperacional({ startDate, endDate }) {
		const response = await api.get("/reportes/operacional", {
			params: { startDate, endDate },
			responseType: "blob",
		});
		downloadBlob(response.data, "reporte-operacional.pdf");
	},
	async descargarGestion({ startDate, endDate }) {
		const response = await api.get("/reportes/gestion", {
			params: { startDate, endDate },
			responseType: "blob",
		});
		downloadBlob(response.data, "reporte-gestion.pdf");
	},
};

export default reporteService;
