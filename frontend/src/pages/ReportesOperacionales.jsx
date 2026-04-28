import { useState } from "react";

import Input from "../components/common/Input";
import BotonPDF from "../components/reportes/BotonPDF";
import { useReportes } from "../hooks/useReportes";

export default function ReportesOperacionales() {
	const [startDate, setStartDate] = useState("");
	const [endDate, setEndDate] = useState("");
	const [msg, setMsg] = useState("");
	const { descargarOperacional } = useReportes();

	const onDownload = async () => {
		await descargarOperacional(startDate, endDate);
		setMsg("Reporte descargado");
	};

	return (
		<section className="max-w-lg space-y-4 rounded-xl bg-white p-6 shadow">
			<h2 className="text-xl font-bold">Reporte operacional</h2>
			<Input label="Fecha inicio" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
			<Input label="Fecha fin" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
			<BotonPDF onClick={onDownload}>Descargar PDF</BotonPDF>
			{msg ? <p className="text-sm text-emerald-700">{msg}</p> : null}
		</section>
	);
}
