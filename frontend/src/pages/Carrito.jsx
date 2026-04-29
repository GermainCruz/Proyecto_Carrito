import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

import CarritoItem from "../components/carrito/CarritoItem";
import ResumenCarrito from "../components/carrito/ResumenCarrito";
import Boton from "../components/common/Boton";
import { useCarrito } from "../hooks/useCarrito";

export default function Carrito() {
	const { cart, refreshCart, updateItem, removeItem, isLoading } = useCarrito();
	const navigate = useNavigate();

	useEffect(() => {
		refreshCart();
	}, []);

	const irAPagar = () => {
		navigate("/pasarela-pago");
	};

	return (
		<section className="grid gap-4 lg:grid-cols-[1fr_320px]">
			<div className="space-y-3">
				<h2 className="text-2xl font-bold">Mi carrito</h2>
				{!cart.items?.length && !isLoading ? <p className="text-slate-600">Tu carrito esta vacio.</p> : null}
				{cart.items?.map((item) => (
					<CarritoItem key={item.id} item={item} onDelete={removeItem} onUpdate={updateItem} />
				))}
			</div>
			<div className="space-y-3">
				<ResumenCarrito resumen={cart.resumen || { subtotal: 0, impuestos: 0, total: 0 }} />
				<Boton
					className="w-full bg-emerald-700 hover:bg-emerald-600 disabled:opacity-50"
					disabled={!cart.items?.length || isLoading}
					onClick={irAPagar}
					type="button"
				>
					Ir a pagar
				</Boton>
				<p className="text-center text-xs text-slate-500">
					Continúa para elegir tu método de pago
				</p>
			</div>
		</section>
	);
}
