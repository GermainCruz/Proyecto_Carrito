import { Link, useNavigate } from "react-router-dom";

import { useAuth } from "../../hooks/useAuth";

const links = [
	{ to: "/productos", label: "Productos" },
	{ to: "/carrito", label: "Carrito", onlyRoles: ["cliente"] },
	{ to: "/mis-pedidos", label: "Mis pedidos", onlyRoles: ["cliente"] },
	{ to: "/dashboard", label: "Dashboard", onlyRoles: ["admin", "gestor"] },
	{ to: "/gestion-pedidos", label: "Pedidos", onlyRoles: ["admin", "gestor"] },
	{ to: "/reportes/operacional", label: "Reporte operacional", onlyRoles: ["admin", "gestor"] },
	{ to: "/reportes/gestion", label: "Reporte gestion", onlyRoles: ["admin", "gestor"] },
];

export default function Header() {
	const { user, logout } = useAuth();
	const navigate = useNavigate();

	const onLogout = async () => {
		await logout();
		navigate("/login");
	};

	return (
		<header className="sticky top-0 z-20 border-b border-slate-200 bg-white/90 backdrop-blur">
			<div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 md:px-6">
				<Link className="font-black tracking-tight" to="/productos">
					CarritoPro
				</Link>
				<nav className="hidden gap-4 md:flex">
			{user
					? links
							.filter((link) => !link.onlyRoles || link.onlyRoles.includes(user.rol))
							.map((link) => (
									<Link className="text-sm text-slate-700 hover:text-black" key={link.to} to={link.to}>
										{link.label}
									</Link>
								))
						: null}
				</nav>
				<div className="text-sm">
					{user ? (
						<div className="flex items-center gap-3">
							<span className="hidden md:inline">{user.nombre}</span>
							<button className="rounded bg-slate-900 px-3 py-1 text-white" onClick={onLogout} type="button">
								Salir
							</button>
						</div>
					) : (
						<Link className="rounded bg-slate-900 px-3 py-1 text-white" to="/login">
							Ingresar
						</Link>
					)}
				</div>
			</div>
		</header>
	);
}
