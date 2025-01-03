import { useForm } from "react-hook-form";
import Home from "./Home";
import { LoginValues } from "../../Types/formValues";
import { useMutation } from "@tanstack/react-query";
import { login } from "../../utils/Api/Auth";
import { useNavigate } from "react-router";
import { routePath } from "../../Routes/routeConstants";

function HomeContainer() {
    const { register, handleSubmit } = useForm<LoginValues>();
    const mutation = useMutation({
        mutationFn: (data: LoginValues) => login(data.email, data.password),
    });
    const navigate = useNavigate();

    const handleSubmitForm = async (data: LoginValues) => {
        const result = await mutation.mutateAsync(data);
        console.log(result);
        navigate(routePath.vehicules);
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

    console.log(mutation);

    return <Home handleStartClick={handleStartClick} register={register} handleSubmit={handleSubmit} handleSubmitForm={handleSubmitForm} isError={mutation.isError} />;
}

export default HomeContainer;
