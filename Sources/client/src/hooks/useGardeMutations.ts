import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createGarde, deleteGarde } from "../App/utils/Api/Gardes";
import { toast } from "react-toastify";

export const useGardeMutations = () => {
    const queryClient = useQueryClient();

    const createGardeMutation = useMutation({
        mutationFn: createGarde,
        onSuccess: () => {
            toast.success("Garde créée avec succès !");
            queryClient.invalidateQueries({ queryKey: ["gardes"] });
        },
        onError: (error: Error & { response?: { data?: { message?: string } } }) => {
            const errorMessage = error.response?.data?.message || "Erreur lors de la création de la garde";
            toast.error(errorMessage);
        },
    });

    const deleteGardeMutation = useMutation({
        mutationFn: deleteGarde,
        onSuccess: () => {
            toast.success("Garde supprimée avec succès !");
            queryClient.invalidateQueries({ queryKey: ["gardes"] });
            queryClient.invalidateQueries({ queryKey: ["users"] });
        },
        onError: (error: Error & { response?: { data?: { message?: string } } }) => {
            const errorMessage = error.response?.data?.message || "Erreur lors de la suppression de la garde";
            toast.error(errorMessage);
        },
    });

    return {
        createGarde: createGardeMutation,
        deleteGarde: deleteGardeMutation,
    };
};
