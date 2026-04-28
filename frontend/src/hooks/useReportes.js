import reporteService from "../services/reporteService";

export function useReportes() {
	const descargarOperacional = (startDate, endDate) =>
		reporteService.descargarOperacional({ startDate, endDate });

	const descargarGestion = (startDate, endDate) =>
		reporteService.descargarGestion({ startDate, endDate });

	return { descargarOperacional, descargarGestion };
}
