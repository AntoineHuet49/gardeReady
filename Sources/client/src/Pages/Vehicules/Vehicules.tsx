import Card from "../../Components/Card/Card";
import { Vehicule } from "../../Types/Vehicules";

type VehiculesProps = {
    vehicules: Vehicule[];
}

function Vehicules({ vehicules }: VehiculesProps) {
    return (
        <div className="container flex flex-col items-center">
            <h1 className="text-6xl m-10">Véhicules</h1>
            <div className="flex flex-wrap justify-center w-full p-6">
                {vehicules.map((vehicule) => (
                    <Card key={vehicule.id} name={vehicule.name} />
                ))}
            </div>
        </div>
    );
}

export default Vehicules;
