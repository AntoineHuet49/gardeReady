import { useQuery } from "@tanstack/react-query";
import Alert from "../../Components/Alert/Alert";
import Loader from "../../Components/Loader/Loader";
import VerificationList from "../../Components/VerificationList/VerificationList";
import { getMyVerifications } from "../../App/utils/Api/Verifications";

export function MesVerifications() {
    const { data, isLoading, error } = useQuery({
        queryKey: ["my-verifications"],
        queryFn: async () => (await getMyVerifications()).data,
    });

    if (isLoading) return <Loader />;
    if (error) return <Alert display type="error" message="Impossible de charger vos vérifications" />;
    return (
        <div className="w-11/12 max-w-4xl">
            <VerificationList items={data ?? []} />
        </div>
    );
}
