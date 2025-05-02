import { useForm } from "react-hook-form";
import Home from "./Home";
import { LoginValues } from "../../Types/formValues";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router";
import { useUser } from "../../App/Provider/UserProvider";
import { login } from "../../App/utils/Api/Auth";
import { routePath } from "../../App/Routes/routeConstants";

function HomeContainer() {
    const { register, handleSubmit } = useForm<LoginValues>();
    const mutation = useMutation({
        mutationFn: (data: LoginValues) => login(data.email, data.password),
    });
    const navigate = useNavigate();

    const { isAdmin } = useUser();

    const handleSubmitForm = async (loginValues: LoginValues) => {
        const response = await mutation.mutateAsync(loginValues);
        if (response.status === 200) {
            if (isAdmin && window.innerWidth > 768) {
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
            isError={mutation.isError}
        />
    );
}

export default HomeContainer;
