import { useQuery } from "@tanstack/react-query";
import Vehicules from "./Vehicules";
import { getAllVehicules } from "../../utils/Api/Vehicules";
import { Vehicule } from "../../Types/Vehicule";
import { useNavigate } from "react-router";

function VehiculesContainer() {
    const {data, isLoading , error} = useQuery({
        queryKey: ["vehicules"],
        queryFn: () => getAllVehicules(),
    });
    const navigate = useNavigate();

    const vehicules: Vehicule[] = data?.data || [];

    return <Vehicules vehicules={vehicules} isLoading={isLoading} error={error} navigate={navigate} />;
}

export default VehiculesContainer;