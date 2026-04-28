import { money } from "../../utils/formateadores";

export default function ResumenCarrito({ resumen }) {
	return (
		<aside className="space-y-2 rounded-xl border border-slate-200 bg-white p-4">
			<h3 className="text-lg font-bold">Resumen</h3>
			<p className="flex justify-between text-sm">
				<span>Subtotal</span>
				<span>{money(resumen.subtotal)}</span>
			</p>
			<p className="flex justify-between text-sm">
				<span>Impuestos</span>
				<span>{money(resumen.impuestos)}</span>
			</p>
			<p className="flex justify-between font-bold">
				<span>Total</span>
				<span>{money(resumen.total)}</span>
			</p>
		</aside>
	);
}
