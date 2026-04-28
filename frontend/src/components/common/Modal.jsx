export default function Modal({ open, title, children, onClose }) {
	if (!open) return null;

	return (
		<div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4">
			<div className="flex w-full max-w-md flex-col rounded-xl bg-white shadow-xl" style={{ maxHeight: "90vh" }}>
				<div className="flex shrink-0 items-center justify-between border-b border-slate-100 px-5 py-4">
					<h3 className="text-lg font-semibold">{title}</h3>
					<button
						className="rounded-lg p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
						onClick={onClose}
						type="button"
					>
						<svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
							<path d="M6 18L18 6M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
						</svg>
					</button>
				</div>
				<div className="overflow-y-auto px-5 py-4">
					{children}
				</div>
			</div>
		</div>
	);
}
