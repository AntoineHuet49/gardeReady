type CardProps = {
    name: string;
}

function Card({ name }: CardProps) {
    return (
        <div className="card bg-base-300 w-96 shadow-xl my-4">
            <div className="flex p-4 justify-between">
                <h2 className="card-title">{name}</h2>
                <button className="btn btn-primary">Vérifier</button>
            </div>
        </div>
    );
}

export default Card;
