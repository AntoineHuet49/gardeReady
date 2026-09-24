import { useMutation, useQueryClient } from "@tanstack/react-query";
import { LoginValues } from "../Types/formValues";
import { login } from "../App/utils/Api/Auth";
import { updateUserRole, updateUser, updateUserGarde, deleteUser, UpdateUserData } from "../App/utils/Api/Users";
import { notify } from "../App/utils/notify";

export const useAuthMutations = () => {
    const queryClient = useQueryClient();

    const loginMutation = useMutation({
        mutationFn: (data: LoginValues) => login(data.email, data.password),
        onError: () => {
            notify("Email ou mot de passe incorrect", "error");
        }
    });

    const updateRoleMutation = useMutation({
        mutationFn: ({ userId, role }: { userId: number; role: string }) => updateUserRole(userId, role),
        onSuccess: () => {
            notify("Rôle mis à jour avec succès", "success");
            queryClient.invalidateQueries({ queryKey: ["users"] });
        },
        onError: (error: Error & { response?: { data?: { message?: string } } }) => {
            notify(error.response?.data?.message || "Erreur lors de la mise à jour du rôle", "error");
        }
    });

    const updateUserMutation = useMutation({
        mutationFn: ({ userId, data }: { userId: number; data: UpdateUserData }) => updateUser(userId, data),
        onSuccess: () => {
            notify("Utilisateur mis à jour avec succès", "success");
            queryClient.invalidateQueries({ queryKey: ["users"] });
        },
        onError: (error: Error & { response?: { data?: { message?: string } } }) => {
            notify(error.response?.data?.message || "Erreur lors de la mise à jour de l'utilisateur", "error");
        }
    });

    const updateGardeMutation = useMutation({
        mutationFn: ({ userId, gardeId }: { userId: number; gardeId: number | null }) => updateUserGarde(userId, gardeId),
        onSuccess: () => {
            notify("Garde mise à jour avec succès", "success");
            queryClient.invalidateQueries({ queryKey: ["users"] });
            queryClient.invalidateQueries({ queryKey: ["gardes"] });
        },
        onError: (error: Error & { response?: { data?: { message?: string } } }) => {
            notify(error.response?.data?.message || "Erreur lors du changement de garde", "error");
        }
    });

    const deleteUserMutation = useMutation({
        mutationFn: (userId: number) => deleteUser(userId),
        onSuccess: () => {
            notify("Utilisateur supprimé avec succès", "success");
            queryClient.invalidateQueries({ queryKey: ["users"] });
            queryClient.invalidateQueries({ queryKey: ["gardes"] });
        },
        onError: (error: Error & { response?: { data?: { message?: string } } }) => {
            notify(error.response?.data?.message || "Erreur lors de la suppression de l'utilisateur", "error");
        }
    });

    return { loginMutation, updateRoleMutation, updateUserMutation, updateGardeMutation, deleteUserMutation };
};
