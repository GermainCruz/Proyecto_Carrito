import { createContext, useMemo, useState } from "react";

import carritoService from "../services/carritoService";

export const CartContext = createContext(null);

export function CartProvider({ children }) {
	const [cart, setCart] = useState({ items: [], resumen: { subtotal: 0, impuestos: 0, total: 0 } });
	const [isLoading, setIsLoading] = useState(false);
	const [notification, setNotification] = useState(null);

	const showNotification = (message, type = "success") => {
		setNotification({ message, type });
		setTimeout(() => setNotification(null), 3000);
	};

	const refreshCart = async () => {
		setIsLoading(true);
		try {
			const data = await carritoService.getMyCart();
			setCart(data);
			return data;
		} finally {
			setIsLoading(false);
		}
	};

	const addItem = async (producto_id, cantidad = 1) => {
		setIsLoading(true);
		try {
			const data = await carritoService.addItem({ producto_id, cantidad });
			setCart(data);
			showNotification("Producto añadido al carrito");
		} catch (error) {
			showNotification(error.response?.data?.message || "Error al añadir producto", "error");
		} finally {
			setIsLoading(false);
		}
	};

	const updateItem = async (producto_id, cantidad) => {
		setIsLoading(true);
		try {
			const data = await carritoService.updateItem(producto_id, { cantidad });
			setCart(data);
		} catch (error) {
			showNotification(error.response?.data?.message || "Error al actualizar cantidad", "error");
		} finally {
			setIsLoading(false);
		}
	};

	const removeItem = async (producto_id) => {
		setIsLoading(true);
		try {
			const data = await carritoService.removeItem(producto_id);
			setCart(data);
			showNotification("Producto eliminado del carrito");
		} catch {
			showNotification("Error al eliminar producto", "error");
		} finally {
			setIsLoading(false);
		}
	};

	const value = useMemo(
		() => ({ cart, isLoading, notification, refreshCart, addItem, updateItem, removeItem, showNotification }),
		[cart, isLoading, notification]
	);

	return (
		<CartContext.Provider value={value}>
			{children}
			{notification && (
				<div
					className={`fixed bottom-4 right-4 z-50 rounded-lg px-6 py-3 text-white shadow-lg transition-all ${
						notification.type === "error" ? "bg-rose-600" : "bg-emerald-600"
					}`}
				>
					{notification.message}
				</div>
			)}
		</CartContext.Provider>
	);
}
