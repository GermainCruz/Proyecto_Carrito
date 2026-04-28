export function money(value) {
	return Number(value || 0).toLocaleString("es-PE", {
		style: "currency",
		currency: "PEN",
	});
}

export function dateFormat(value) {
	return new Intl.DateTimeFormat("es-PE", {
		timeZone: "America/Lima",
		year: "numeric",
		month: "2-digit",
		day: "2-digit",
	}).format(new Date(value));
}

export function dateTimeFormat(value) {
	return new Intl.DateTimeFormat("es-PE", {
		timeZone: "America/Lima",
		year: "numeric",
		month: "2-digit",
		day: "2-digit",
		hour: "2-digit",
		minute: "2-digit",
		hour12: false,
	}).format(new Date(value));
}
