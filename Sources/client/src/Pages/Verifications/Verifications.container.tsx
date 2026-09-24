import { useMutation, useQuery } from "@tanstack/react-query";
import Details from "./Verifications";
import { useNavigate, useParams } from "react-router";
import { useForm } from "react-hook-form";
import { VerificationValues } from "../../Types/formValues";
import { getVehiculeById } from "../../App/utils/Api/Vehicules";
import { sendVerifications } from "../../App/utils/Api/Verifications";
import { notify } from "../../App/utils/notify";
import { routePath } from "../../App/Routes/routeConstants";

function VerificationsContainer() {
    const navigate = useNavigate();
    const { id } = useParams();
    const { data, isLoading, error } = useQuery({
        queryKey: ["details"],
        queryFn: () => getVehiculeById(id!),
    });
    const verification = useMutation({
        mutationFn: (data: VerificationValues[]) =>
            sendVerifications(id!, data),
    });

    // Aucun statut par défaut : chaque élément doit être explicitement coché OK/KO
    const { register, handleSubmit, watch } = useForm<VerificationValues[]>({
        shouldUnregister: true,
    });

    const onSubmit = async (data: VerificationValues[]) => {
        const response = await verification.mutateAsync(data);
        if (response.status >= 200 && response.status < 300) {
            notify("Verifications envoyées", "success");
            navigate(routePath.vehicules);
        } else {
            notify("Une erreur est survenue", "error");
        }
    };

    return (
        <Details
            vehicule={data?.data}
            isLoading={isLoading}
            error={error}
            register={register}
            handleSubmit={handleSubmit}
            onSubmit={onSubmit}
            isPending={verification.isPending}
            watch={watch}
        />
    );
}

export default VerificationsContainer;
