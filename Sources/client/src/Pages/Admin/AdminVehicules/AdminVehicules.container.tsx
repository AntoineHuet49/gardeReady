import { useQuery } from "@tanstack/react-query";
import { getAllVehicules, getVehiculeById } from "../../../App/utils/Api/Vehicules";
import { Vehicule } from "../../../Types/Vehicule";
import AdminVehicules from "./AdminVehicules";

const AdminVehiculesContainer = () => {
    const {
        data: vehicules,
        isLoading,
        error
    } = useQuery({
        queryKey: ["admin-vehicules"],
        queryFn: async () => {
            // Récupérer tous les véhicules
            const allVehiculesResponse = await getAllVehicules();
            const allVehicules = allVehiculesResponse.data;
            
            // Pour chaque véhicule, récupérer ses détails avec sections
            const vehiculesWithSections = await Promise.all(
                allVehicules.map(async (vehicule: Vehicule) => {
                    const detailedResponse = await getVehiculeById(vehicule.id.toString());
                    return detailedResponse.data;
                })
            );
            
            return vehiculesWithSections;
        }
    });

    return (
        <AdminVehicules 
            vehicules={vehicules || []}
            isLoading={isLoading}
            error={error}
        />
    );
};

export default AdminVehiculesContainer;
