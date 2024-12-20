import { useForm } from "@tanstack/react-form";
import Home from "./Home";

function HomeContainer() {
    const form = useForm({
        defaultValues: {
            email: '',
            password: ''
        },
        onSubmit:  async data => {
            console.log(data)
            data.formApi.setFieldValue("password", "");
        }
    });

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

    return <Home handleStartClick={handleStartClick} form={form} />;
}

export default HomeContainer;
