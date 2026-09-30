import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { getGardeRotation, updateGardeRotation } from "../App/utils/Api/Gardes";

export const useGardeRotation = () => {
    const queryClient = useQueryClient();

    const { data, isLoading, error } = useQuery({
        queryKey: ["garde-rotation"],
        queryFn: () => getGardeRotation(),
    });

    const updateRotation = useMutation({
        mutationFn: updateGardeRotation,
        onSuccess: () => {
            toast.success("Rotation des gardes enregistrée !");
            queryClient.invalidateQueries({ queryKey: ["garde-rotation"] });
        },
        onError: (error: Error & { response?: { data?: { message?: string } } }) => {
            toast.error(error.response?.data?.message || "Erreur lors de l'enregistrement de la rotation");
        },
    });

    return { rotation: data ?? null, isLoading, error, updateRotation };
};
