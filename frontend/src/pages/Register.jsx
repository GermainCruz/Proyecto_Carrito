import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { useAuth } from "../hooks/useAuth";

export default function Register() {
	const [form, setForm] = useState({
		nombre: "",
		correo_electronico: "",
		contrasena: "",
	});
	const [error, setError] = useState("");
	const [success, setSuccess] = useState("");
	const { register } = useAuth();
	const navigate = useNavigate();

	const onSubmit = async (e) => {
		e.preventDefault();
		setError("");
		setSuccess("");

		try {
			await register({ ...form, rol: "cliente" });
			setSuccess("Cuenta creada correctamente. Ahora puedes iniciar sesión.");
			setTimeout(() => navigate("/login"), 1100);
		} catch (err) {
			setError(err.response?.data?.message || "No se pudo completar el registro.");
		}
	};

	return (
		<div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#0d3a5f] via-[#17517f] to-[#2a6b9d] p-4">
			<div className="w-full max-w-md rounded-3xl bg-white/95 p-8 shadow-2xl ring-1 ring-black/5 sm:p-10">
				<h1 className="text-center text-3xl font-black tracking-tight text-[#11446f]">Crear cuenta</h1>
				<p className="mt-2 text-center text-sm text-slate-600">Regístrate para acceder al sistema comercial.</p>

				<form className="mt-7 space-y-4" onSubmit={onSubmit}>
					<div>
						<label className="mb-1.5 block text-sm font-semibold text-slate-700" htmlFor="nombre">
							Nombre completo
						</label>
						<input
							id="nombre"
							required
							className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-800 outline-none transition focus:border-[#1a4f80] focus:ring-2 focus:ring-[#1a4f80]/20"
							placeholder="Ejemplo: María Pérez"
							value={form.nombre}
							onChange={(e) => setForm((prev) => ({ ...prev, nombre: e.target.value }))}
						/>
					</div>

					<div>
						<label className="mb-1.5 block text-sm font-semibold text-slate-700" htmlFor="correo">
							Correo electrónico
						</label>
						<input
							id="correo"
							type="email"
							required
							className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-800 outline-none transition focus:border-[#1a4f80] focus:ring-2 focus:ring-[#1a4f80]/20"
							placeholder="nombre@correo.com"
							value={form.correo_electronico}
							onChange={(e) => setForm((prev) => ({ ...prev, correo_electronico: e.target.value }))}
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
							minLength={6}
							className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-800 outline-none transition focus:border-[#1a4f80] focus:ring-2 focus:ring-[#1a4f80]/20"
							placeholder="Mínimo 6 caracteres"
							value={form.contrasena}
							onChange={(e) => setForm((prev) => ({ ...prev, contrasena: e.target.value }))}
						/>
					</div>

					{error ? <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p> : null}
					{success ? <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{success}</p> : null}

					<button
						type="submit"
						className="w-full rounded-xl bg-gradient-to-r from-[#1a4f80] to-[#2a6b9d] px-4 py-3 text-base font-semibold text-white shadow-md transition hover:brightness-110"
					>
						Registrarme
					</button>
				</form>

				<p className="mt-6 text-center text-sm text-slate-600">
					¿Ya tienes una cuenta?{" "}
					<Link to="/login" className="font-semibold text-[#1a4f80] hover:text-[#123d6a]">
						Inicia sesión aquí
					</Link>
				</p>
			</div>
		</div>
	);
}
