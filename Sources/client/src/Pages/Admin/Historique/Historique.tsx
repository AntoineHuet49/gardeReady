import { useQuery } from "@tanstack/react-query";
import Alert from "../../../Components/Alert/Alert";
import Loader from "../../../Components/Loader/Loader";
import VerificationList from "../../../Components/VerificationList/VerificationList";
import { getVerificationHistory } from "../../../App/utils/Api/Verifications";

function Historique() {
    const { data, isLoading, error } = useQuery({
        queryKey: ["verification-history"],
        queryFn: async () => (await getVerificationHistory()).data,
    });

    if (isLoading) return <Loader />;
    if (error) return <Alert display type="error" message="Impossible de charger l'historique" />;
    return <VerificationList items={data ?? []} />;
}

export default Historique;
