import { useQuery } from "@tanstack/react-query";
import Details from "./Verifications";
import { getVehiculeById } from "../../utils/Api/Vehicules";
import { useParams } from "react-router";

function VerificationsContainer() {
    const { id } = useParams();
    const {data, isLoading , error} = useQuery({
        queryKey: ["details"],
        queryFn: () => getVehiculeById(id!),
    })

    return <Details vehicule={data?.data} isLoading={isLoading} error={error} />;
}

export default VerificationsContainer;