import { useQuery } from "@tanstack/react-query";
import Details from "./Verifications";
import { getVehiculeById } from "../../utils/Api/Vehicules";

function VerificationsContainer() {
    const {data, isLoading , error} = useQuery({
        queryKey: ["details"],
        queryFn: () => getVehiculeById("1"),
    })

    return <Details vehicule={data?.data} isLoading={isLoading} error={error} />;
}

export default VerificationsContainer;