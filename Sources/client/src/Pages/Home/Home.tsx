import { UseFormHandleSubmit, UseFormRegister, FieldErrors } from "react-hook-form";
import Button from "../../Components/Button/button";
import TextInput from "../../Components/Input/TextInput";
import { LoginValues } from "../../Types/formValues";
import MailIcon from "../../assets/icons/mail.svg";
import PasswordIcon from "../../assets/icons/password.svg";

type HomeProps = {
    handleStartClick: () => void;
    register: UseFormRegister<LoginValues>;
    handleSubmit: UseFormHandleSubmit<LoginValues>;
    handleSubmitForm: (data: LoginValues) => void;
    errors: FieldErrors<LoginValues>;
};

function Home({
    handleStartClick,
    register,
    handleSubmit,
    handleSubmitForm,
    errors,
}: HomeProps) {
    return (
        <div className="container flex flex-col items-center justify-center h-screen">
            <h1 id="homeTitle" className="text-6xl mb-20">
                Véri'Feu
            </h1>
            <Button
                id="startButton"
                text="Commencer"
                onClick={handleStartClick}
            />
            <form
                id="loginForm"
                className="hero bg-base p-5 w-3/4 lg:w-1/2 xl:w-1/3 h-fit absolute flex-col border-2 border-base-300 rounded-lg hidden"
                onSubmit={handleSubmit(handleSubmitForm)}
            >
                <h2 className="text-3xl mb-4">Connexion</h2>
                <TextInput
                    placeholder="email"
                    icon={MailIcon}
                    register={register}
                    name="email"
                    errors={errors}
                />
                <TextInput
                    placeholder="Mot de passe"
                    icon={PasswordIcon}
                    register={register}
                    name="password"
                    isPassword
                    errors={errors}
                />
                <Button text="Connexion" />
            </form>
        </div>
    );
}

export default Home;
