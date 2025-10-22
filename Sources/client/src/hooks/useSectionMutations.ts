import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createSection, updateSection, deleteSection } from "../App/utils/Api/Sections";
import { notify } from "../App/utils/notify";

export const useSectionMutations = () => {
    const queryClient = useQueryClient();

    const createSectionMutation = useMutation({
        mutationFn: (data: { name: string; vehicule_id?: number; parent_section_id?: number }) => createSection(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["admin-vehicules"] });
            notify("Section créée avec succès !", "success");
        },
        onError: (error: Error & { response?: { data?: { error?: string } } }) => {
            const errorMessage = error.response?.data?.error || "Erreur lors de la création de la section";
            notify(errorMessage, "error");
            console.error("Erreur lors de la création:", error);
        }
    });

    const updateSectionMutation = useMutation({
        mutationFn: ({ id, data }: { id: number; data: { name: string } }) => updateSection(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["admin-vehicules"] });
            notify("Section modifiée avec succès !", "success");
        },
        onError: (error: Error & { response?: { data?: { error?: string } } }) => {
            const errorMessage = error.response?.data?.error || "Erreur lors de la modification de la section";
            notify(errorMessage, "error");
            console.error("Erreur lors de la modification:", error);
        }
    });

    const deleteSectionMutation = useMutation({
        mutationFn: (id: number) => deleteSection(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["admin-vehicules"] });
            notify("Section supprimée avec succès !", "success");
        },
        onError: (error: Error & { response?: { data?: { error?: string } } }) => {
            const errorMessage = error.response?.data?.error || "Erreur lors de la suppression de la section";
            notify(errorMessage, "error");
            console.error("Erreur lors de la suppression:", error);
        }
    });

    return {
        createSectionMutation,
        updateSectionMutation,
        deleteSectionMutation
    };
};