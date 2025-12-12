import { useMutation } from "@tanstack/react-query";
import { LoginValues } from "../Types/formValues";
import { login } from "../App/utils/Api/Auth";
import { notify } from "../App/utils/notify";

export const useAuthMutations = () => {
    const loginMutation = useMutation({
        mutationFn: (data: LoginValues) => login(data.email, data.password),
        onError: () => {
            notify("Email ou mot de passe incorrect", "error");
        }
    });

    return { loginMutation };
};
