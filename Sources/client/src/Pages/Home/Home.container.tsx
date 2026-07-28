import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useSearchParams } from "react-router";
import Home from "./Home";
import { LoginValues } from "../../Types/formValues";
import { getMicrosoftLoginUrl } from "../../App/utils/Api/Auth";
import { notify } from "../../App/utils/notify";
import { useUser } from "../../App/Provider/UserProvider";
import { routePath } from "../../App/Routes/routeConstants";
import { useAuthMutations } from "../../hooks/useAuthMutations";
import { useAuthProvider } from "../../hooks/useAuthProvider";

function HomeContainer() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { isAuthenticated, isAdmin, refreshUser } = useUser();
    const { provider, isLoading: isAuthProviderLoading } = useAuthProvider();
    const { loginMutation } = useAuthMutations();
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginValues>();

    useEffect(() => {
        if (searchParams.get("authError")) {
            notify("La connexion avec Microsoft a échoué. Contactez un administrateur si le problème persiste.", "error");
        }
    }, [searchParams]);

    useEffect(() => {
        if (isAuthenticated) {
            navigate(isAdmin && window.innerWidth > 768 ? routePath.admin : routePath.vehicules);
        }
    }, [isAuthenticated, isAdmin, navigate]);

    const handleMicrosoftLogin = () => {
        window.location.href = getMicrosoftLoginUrl();
    };

    const handleSubmitForm = async (loginValues: LoginValues) => {
        const response = await loginMutation.mutateAsync(loginValues);
        if (response.status === 200) {
            const { isAdmin: userIsAdmin } = refreshUser();
            navigate(userIsAdmin && window.innerWidth > 768 ? routePath.admin : routePath.vehicules);
        }
    };

    const handleStartClick = () => {
        document
            .getElementById("homeTitle")
            ?.classList.add("slide_title_on_top");
        document.getElementById("startButton")?.classList.add("opacity-0");
        setTimeout(() => {
            const loginForm = document.getElementById("loginForm");
            loginForm?.classList.add("appear");
            loginForm?.classList.remove("hidden");
        }, 300);
    };

    return (
        <Home
            handleStartClick={handleStartClick}
            authProvider={provider}
            isAuthProviderLoading={isAuthProviderLoading}
            handleMicrosoftLogin={handleMicrosoftLogin}
            register={register}
            handleSubmit={handleSubmit}
            handleSubmitForm={handleSubmitForm}
            errors={errors}
        />
    );
}

export default HomeContainer;
