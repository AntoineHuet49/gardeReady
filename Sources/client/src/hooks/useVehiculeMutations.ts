import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createVehicule, deleteVehicule } from "../App/utils/Api/Vehicules";
import { notify } from "../App/utils/notify";

export const useVehiculeMutations = () => {
    const queryClient = useQueryClient();

    const createVehiculeMutation = useMutation({
        mutationFn: (data: { name: string }) => createVehicule(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["admin-vehicules"] });
            notify("Véhicule créé avec succès !", "success");
        },
        onError: (error: Error & { response?: { data?: { error?: string } } }) => {
            const errorMessage = error.response?.data?.error || "Erreur lors de la création du véhicule";
            notify(errorMessage, "error");
            console.error("Erreur lors de la création:", error);
        }
    });

    const deleteVehiculeMutation = useMutation({
        mutationFn: (id: number) => deleteVehicule(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["admin-vehicules"] });
            notify("Véhicule supprimé avec succès !", "success");
        },
        onError: (error: Error & { response?: { data?: { error?: string } } }) => {
            const errorMessage = error.response?.data?.error || "Erreur lors de la suppression du véhicule";
            notify(errorMessage, "error");
            console.error("Erreur lors de la suppression:", error);
        }
    });

    return {
        createVehiculeMutation,
        deleteVehiculeMutation
    };
};
