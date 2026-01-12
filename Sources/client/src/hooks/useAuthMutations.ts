import { useMutation, useQueryClient } from "@tanstack/react-query";
import { LoginValues } from "../Types/formValues";
import { login } from "../App/utils/Api/Auth";
import { updateUserRole } from "../App/utils/Api/Users";
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

    return { loginMutation, updateRoleMutation };
};
