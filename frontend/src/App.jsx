import { Navigate, Route, Routes, useLocation } from "react-router-dom";

import Header from "./components/layout/Header";
import Footer from "./components/layout/Footer";
import { useAuth } from "./hooks/useAuth";
import Login from "./pages/Login";
import Productos from "./pages/Productos";
import Carrito from "./pages/Carrito";
import Dashboard from "./pages/Dashboard";
import MisPedidos from "./pages/MisPedidos";
import ReportesOperacionales from "./pages/ReportesOperacionales";
import ReportesGestion from "./pages/ReportesGestion";
import Register from "./pages/Register";
import GestionPedidos from "./pages/GestionPedidos";

function ProtectedRoute({ children, roles = [] }) {
	const { user, isLoading } = useAuth();

	if (isLoading) {
		return <p className="p-8">Cargando...</p>;
	}

	if (!user) {
		return <Navigate to="/login" replace />;
	}

	if (roles.length && !roles.includes(user.rol)) {
		return <Navigate to="/productos" replace />;
	}

	return children;
}

function App() {
	const { user } = useAuth();
	const { pathname } = useLocation();
	const isAuthScreen = pathname === "/login" || pathname === "/registro";

	return (
		<div className={isAuthScreen ? "min-h-screen" : "min-h-screen bg-slate-50 text-slate-900"}>
			{!isAuthScreen ? <Header /> : null}
			<main className={isAuthScreen ? "min-h-screen" : "mx-auto max-w-6xl p-4 md:p-6"}>
				<Routes>
					<Route path="/" element={<Navigate to={user ? "/productos" : "/login"} replace />} />
					<Route path="/login" element={user ? <Navigate to="/productos" replace /> : <Login />} />
					<Route path="/registro" element={user ? <Navigate to="/productos" replace /> : <Register />} />
					<Route
						path="/productos"
						element={
							<ProtectedRoute>
								<Productos />
							</ProtectedRoute>
						}
					/>
					<Route
						path="/carrito"
						element={
							<ProtectedRoute roles={["cliente", "admin", "gestor"]}>
								<Carrito />
							</ProtectedRoute>
						}
					/>
					<Route
						path="/mis-pedidos"
						element={
							<ProtectedRoute roles={["cliente", "admin", "gestor"]}>
								<MisPedidos />
							</ProtectedRoute>
						}
					/>
					<Route
						path="/dashboard"
						element={
							<ProtectedRoute roles={["admin", "gestor"]}>
								<Dashboard />
							</ProtectedRoute>
						}
					/>
				<Route
					path="/gestion-pedidos"
					element={
						<ProtectedRoute roles={["admin", "gestor"]}>
							<GestionPedidos />
						</ProtectedRoute>
					}
				/>
				<Route
					path="/reportes/operacional"
					element={
						<ProtectedRoute roles={["admin", "gestor"]}>
							<ReportesOperacionales />
						</ProtectedRoute>
					}
				/>
					<Route
						path="/reportes/gestion"
						element={
							<ProtectedRoute roles={["admin", "gestor"]}>
								<ReportesGestion />
							</ProtectedRoute>
						}
					/>
					<Route
						path="*"
						element={
							<Navigate to={user ? "/productos" : "/login"} replace />
						}
					/>
				</Routes>
			</main>
			{!isAuthScreen ? <Footer /> : null}
		</div>
	);
}

export default App;
