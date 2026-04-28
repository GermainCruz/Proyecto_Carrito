export default function Boton({ children, className = "", ...props }) {
	return (
		<button
			{...props}
			className={`rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-md transition duration-200 hover:-translate-y-0.5 hover:bg-slate-700 hover:shadow-lg active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60 ${className}`}
		>
			{children}
		</button>
	);
}
