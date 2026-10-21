import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createVehicule, deleteVehicule, updateVehicule } from "../App/utils/Api/Vehicules";
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

    const updateVehiculeMutation = useMutation({
        mutationFn: ({ id, name }: { id: number; name: string }) => updateVehicule(id, { name }),
        onSuccess: () => {
            // Le nom s'affiche aussi dans les vérifications et l'accueil
            queryClient.invalidateQueries({ queryKey: ["admin-vehicules"] });
            queryClient.invalidateQueries({ queryKey: ["vehicules"] });
            notify("Véhicule renommé avec succès !", "success");
        },
        onError: (error: Error & { response?: { data?: { error?: string } } }) => {
            notify(error.response?.data?.error || "Erreur lors du renommage du véhicule", "error");
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
        updateVehiculeMutation,
        deleteVehiculeMutation
    };
};
