import { useForm } from "react-hook-form";
import Home from "./Home";
import { LoginValues } from "../../Types/formValues";
import { useNavigate } from "react-router";
import { useUser } from "../../App/Provider/UserProvider";
import { routePath } from "../../App/Routes/routeConstants";
import { useAuthMutations } from "../../hooks/useAuthMutations";

function HomeContainer() {
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginValues>();
    const { loginMutation } = useAuthMutations();
    const navigate = useNavigate();

    const { refreshUser } = useUser();

    const handleSubmitForm = async (loginValues: LoginValues) => {
        const response = await loginMutation.mutateAsync(loginValues);
        console.log(response);
        if (response.status === 200) {
            // Rafraîchir et récupérer directement les informations utilisateur
            const { isAdmin: userIsAdmin } = refreshUser();

            // Navigation immédiate basée sur le rôle
            if (userIsAdmin && window.innerWidth > 768) {
                navigate(routePath.admin);
            } else {
                navigate(routePath.vehicules);
            }
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
            register={register}
            handleSubmit={handleSubmit}
            handleSubmitForm={handleSubmitForm}
            errors={errors}
        />
    );
}

export default HomeContainer;
