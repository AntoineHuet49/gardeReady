import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { addKilometrage, getKilometrages } from "../App/utils/Api/Kilometrages";

export const useKilometrages = (vehiculeId: number | null, enabled: boolean) =>
    useQuery({
        queryKey: ["kilometrages", vehiculeId],
        queryFn: () => getKilometrages(vehiculeId!),
        enabled: enabled && vehiculeId !== null,
    });

export const useAddKilometrage = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ vehiculeId, ...data }: { vehiculeId: number; kilometrage: number; motif?: string }) =>
            addKilometrage(vehiculeId, data),
        onSuccess: () => {
            toast.success("Kilométrage enregistré !");
            queryClient.invalidateQueries({ queryKey: ["kilometrages"] });
        },
        onError: (error: Error & { response?: { data?: { message?: string } } }) => {
            toast.error(error.response?.data?.message || "Erreur lors de l'enregistrement du kilométrage");
        },
    });
};
