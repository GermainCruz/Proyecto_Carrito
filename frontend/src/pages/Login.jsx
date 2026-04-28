import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { useAuth } from "../hooks/useAuth";

export default function Login() {
	const [form, setForm] = useState({ correo_electronico: "", contrasena: "" });
	const [error, setError] = useState("");
	const { login } = useAuth();
	const navigate = useNavigate();

	const onLogin = async (e) => {
		e.preventDefault();
		setError("");
		try {
			await login(form);
			navigate("/productos");
		} catch (err) {
			setError(err.response?.data?.message || "No se pudo iniciar sesión.");
		}
	};

	return (
		<div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#0b2b4f] via-[#123d6a] to-[#1a4f80] p-4">
			<div className="w-full max-w-md rounded-3xl bg-slate-50 p-8 shadow-2xl ring-1 ring-black/5 sm:p-10">
				<div className="mb-8 text-center">
					<div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#f59e0b] to-[#f97316] text-2xl font-bold text-white shadow-lg">
						C
					</div>
					<h1 className="text-4xl font-black tracking-tight text-[#123d6a]">CarritoPro</h1>
					<p className="mt-3 text-lg leading-6 text-slate-600">Sistema comercial de gestión de compras</p>
				</div>

				<form className="space-y-4" onSubmit={onLogin}>
					<div>
						<label className="mb-1.5 block text-sm font-semibold text-slate-700" htmlFor="correo">
							Usuario o correo electrónico
						</label>
						<input
							id="correo"
							type="email"
							required
							className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-800 outline-none transition focus:border-[#1a4f80] focus:ring-2 focus:ring-[#1a4f80]/20"
							placeholder="Ingresa tu usuario o correo"
							value={form.correo_electronico}
							onChange={(e) => setForm((f) => ({ ...f, correo_electronico: e.target.value }))}
						/>
					</div>
					<div>
						<label className="mb-1.5 block text-sm font-semibold text-slate-700" htmlFor="contrasena">
							Contraseña
						</label>
						<input
							id="contrasena"
							type="password"
							required
							className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-800 outline-none transition focus:border-[#1a4f80] focus:ring-2 focus:ring-[#1a4f80]/20"
							placeholder="Ingresa tu contraseña"
							value={form.contrasena}
							onChange={(e) => setForm((f) => ({ ...f, contrasena: e.target.value }))}
						/>
					</div>

					{error ? <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p> : null}

					<button
						type="submit"
						className="w-full rounded-xl bg-gradient-to-r from-[#1a4f80] to-[#2563a6] px-4 py-3 text-lg font-semibold text-white shadow-md transition hover:brightness-110"
					>
						Iniciar sesión
					</button>
				</form>

				<p className="mt-6 text-center text-base text-slate-600">
					¿No tienes cuenta?{" "}
					<Link to="/registro" className="font-bold text-[#1a4f80] hover:text-[#123d6a]">
						Regístrate aquí
					</Link>
				</p>

				<p className="mt-4 text-center text-xs text-slate-400">Acceso seguro para personal y clientes registrados.</p>
			</div>
		</div>
	);
}
