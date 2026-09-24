import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createSection, updateSection, deleteSection, uploadSectionPhoto, deleteSectionPhoto } from "../App/utils/Api/Sections";
import { notify } from "../App/utils/notify";
import { resizeImage } from "../App/utils/resizeImage";

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

    // La photo est visible dans l'admin et pendant la vérification ("details")
    const invalidatePhotoQueries = () => {
        queryClient.invalidateQueries({ queryKey: ["admin-vehicules"] });
        queryClient.invalidateQueries({ queryKey: ["details"] });
    };

    const uploadSectionPhotoMutation = useMutation({
        mutationFn: async ({ id, file }: { id: number; file: File }) => uploadSectionPhoto(id, await resizeImage(file)),
        onSuccess: () => {
            invalidatePhotoQueries();
            notify("Photo enregistrée !", "success");
        },
        onError: (error: Error & { response?: { data?: { error?: string } } }) => {
            notify(error.response?.data?.error || "Erreur lors de l'envoi de la photo", "error");
        }
    });

    const deleteSectionPhotoMutation = useMutation({
        mutationFn: (id: number) => deleteSectionPhoto(id),
        onSuccess: () => {
            invalidatePhotoQueries();
            notify("Photo supprimée !", "success");
        },
        onError: (error: Error & { response?: { data?: { error?: string } } }) => {
            notify(error.response?.data?.error || "Erreur lors de la suppression de la photo", "error");
        }
    });

    return {
        createSectionMutation,
        updateSectionMutation,
        deleteSectionMutation,
        uploadSectionPhotoMutation,
        deleteSectionPhotoMutation
    };
};