import { useMutation, useQueryClient } from "@tanstack/react-query";
import { LoginValues } from "../Types/formValues";
import { login } from "../App/utils/Api/Auth";
import { updateUserRole, deleteUser } from "../App/utils/Api/Users";
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
        onError: (error: any) => {
            notify(error.response?.data?.message || "Erreur lors de la mise à jour du rôle", "error");
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

    return { loginMutation, updateRoleMutation, deleteUserMutation };
};
