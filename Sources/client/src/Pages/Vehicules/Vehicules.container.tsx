import { Vehicule } from "../../Types/Vehicules";
import Vehicules from "./Vehicules";

function VehiculesContainer() {
    const vehicules: Vehicule[] = [
        { id: 1, name: "Vehicule 1" },
        { id: 2, name: "Vehicule 2" },
        { id: 3, name: "Vehicule 3" },
    ];

    return <Vehicules vehicules={vehicules} />;
}

export default VehiculesContainer;