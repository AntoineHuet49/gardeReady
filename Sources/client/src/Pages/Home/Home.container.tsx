import { useForm } from "react-hook-form";
import Home from "./Home";
import { LoginValues } from "../../Types/formValues";

function HomeContainer() {
    const { register, handleSubmit } = useForm<LoginValues>();

    const handleSubmitForm = (data: LoginValues) => {
        console.log(data);
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

    return <Home handleStartClick={handleStartClick} register={register} handleSubmit={handleSubmit} handleSubmitForm={handleSubmitForm} />;
}

export default HomeContainer;
