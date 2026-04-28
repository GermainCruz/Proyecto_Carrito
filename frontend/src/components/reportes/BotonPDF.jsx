import Boton from "../common/Boton";

export default function BotonPDF({ onClick, children }) {
	return (
		<Boton className="bg-emerald-700 hover:bg-emerald-600" onClick={onClick} type="button">
			{children}
		</Boton>
	);
}
