import Boton from "../common/Boton";
import Input from "../common/Input";
import { money } from "../../utils/formateadores";

export default function CarritoItem({ item, onUpdate, onDelete }) {
	const quantityIsAlert = Number(item.cantidad) === 10;

	return (
		<div className="grid gap-3 rounded-xl border border-slate-200 bg-white p-4 md:grid-cols-[1fr_auto_auto] md:items-end">
			<div>
				<p className="font-semibold">{item.nombre}</p>
				<p className="text-sm text-slate-600">Precio unitario: {money(item.precio_unitario)}</p>
			</div>

			<div>
				<Input
					label="Cantidad"
					min={1}
					max={100}
					type="number"
					value={item.cantidad}
					className={quantityIsAlert ? "border-rose-400 text-rose-700" : ""}
					onChange={(e) => onUpdate(item.producto_id, Number(e.target.value))}
				/>
				{quantityIsAlert ? <p className="mt-1 text-xs font-semibold text-rose-700">Cantidad 10 detectada</p> : null}
			</div>

			<div className="flex items-center gap-2">
				<span className="text-sm font-semibold">{money(item.subtotal)}</span>
				<Boton className="bg-rose-700 hover:bg-rose-600" onClick={() => onDelete(item.producto_id)} type="button">
					Quitar
				</Boton>
			</div>
		</div>
	);
}
