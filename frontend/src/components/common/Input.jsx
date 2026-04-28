export default function Input({ label, className = "", ...props }) {
	return (
		<label className="block space-y-1">
			{label ? <span className="text-sm font-medium text-slate-700">{label}</span> : null}
			<input
				{...props}
				className={`w-full rounded-lg border border-slate-300 px-3 py-2 outline-none ring-0 focus:border-slate-500 ${className}`}
			/>
		</label>
	);
}
