import { useContext } from "react";

import { CartContext } from "../context/CartContext";

export function useCarrito() {
	const context = useContext(CartContext);
	if (!context) {
		throw new Error("useCarrito debe usarse dentro de CartProvider");
	}
	return context;
}
