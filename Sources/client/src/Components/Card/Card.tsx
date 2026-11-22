type CardProps = {
    name: string;
    onClick: React.MouseEventHandler<HTMLButtonElement>;
    highlighted?: boolean; // véhicule assigné à l'agent pour sa prise de garde
    colleagues?: string[]; // si assigné : les autres agents sur ce véhicule (vide = seul)
}

function Card({ name, onClick, highlighted = false, colleagues }: CardProps) {
    return (
        <div className={`card bg-base-300 w-96 shadow-xl my-4 lg:m-4 ${highlighted ? "ring-2 ring-primary" : ""}`}>
            <div className="flex p-4 justify-between items-center gap-2">
                <h2 className="card-title">
                    {name}
                    {highlighted && <span className="badge badge-primary badge-sm">Assigné</span>}
                </h2>
                {highlighted && colleagues && (
                    <p className="text-sm text-base-content/70 grow">
                        {colleagues.length === 0 ? "Seul" : `Avec ${colleagues.join(", ")}`}
                    </p>
                )}
                <button onClick={onClick} className="btn btn-primary">Vérifier</button>
            </div>
        </div>
    );
}

export default Card;
