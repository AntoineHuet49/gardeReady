type CardProps = {
    name: string;
    onClick: React.MouseEventHandler<HTMLButtonElement>;
    highlighted?: boolean; // véhicule assigné à l'agent pour sa prise de garde
}

function Card({ name, onClick, highlighted = false }: CardProps) {
    return (
        <div className={`card bg-base-300 w-96 shadow-xl my-4 lg:m-4 ${highlighted ? "ring-2 ring-primary" : ""}`}>
            <div className="flex p-4 justify-between items-center gap-2">
                <h2 className="card-title">
                    {name}
                    {highlighted && <span className="badge badge-primary badge-sm">Assigné</span>}
                </h2>
                <button onClick={onClick} className="btn btn-primary">Vérifier</button>
            </div>
        </div>
    );
}

export default Card;
