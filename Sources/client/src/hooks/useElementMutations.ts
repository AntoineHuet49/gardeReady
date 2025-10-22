import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createElement, updateElement, deleteElement } from "../App/utils/Api/Elements";
import { notify } from "../App/utils/notify";

export const useElementMutations = () => {
    const queryClient = useQueryClient();

    const createElementMutation = useMutation({
        mutationFn: (data: { name: string; section_id: number }) => createElement(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["admin-vehicules"] });
            notify("Équipement créé avec succès !", "success");
        },
        onError: (error: Error & { response?: { data?: { error?: string } } }) => {
            const errorMessage = error.response?.data?.error || "Erreur lors de la création de l'équipement";
            notify(errorMessage, "error");
            console.error("Erreur lors de la création:", error);
        }
    });

    const updateElementMutation = useMutation({
        mutationFn: ({ id, data }: { id: number; data: { name: string } }) => updateElement(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["admin-vehicules"] });
            notify("Équipement modifié avec succès !", "success");
        },
        onError: (error: Error & { response?: { data?: { error?: string } } }) => {
            const errorMessage = error.response?.data?.error || "Erreur lors de la modification de l'équipement";
            notify(errorMessage, "error");
            console.error("Erreur lors de la modification:", error);
        }
    });

    const deleteElementMutation = useMutation({
        mutationFn: (id: number) => deleteElement(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["admin-vehicules"] });
            notify("Équipement supprimé avec succès !", "success");
        },
        onError: (error: Error & { response?: { data?: { error?: string } } }) => {
            const errorMessage = error.response?.data?.error || "Erreur lors de la suppression de l'équipement";
            notify(errorMessage, "error");
            console.error("Erreur lors de la suppression:", error);
        }
    });

    return {
        createElementMutation,
        updateElementMutation,
        deleteElementMutation
    };
};