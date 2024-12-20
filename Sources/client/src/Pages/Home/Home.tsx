import { UseFormHandleSubmit, UseFormRegister } from "react-hook-form";
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
};

function Home({ handleStartClick, register, handleSubmit, handleSubmitForm }: HomeProps) {
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
                className="hero bg-base p-5 w-3/4 h-fit absolute flex-col border-2 border-base-300 rounded-lg hidden"
                onSubmit={handleSubmit(handleSubmitForm)}
            >
                <h2 className="text-3xl mb-8">Connexion</h2>
                        <TextInput
                            placeholder="email"
                            icon={MailIcon}
                            register={register}
                            name="email"
                        />
                        <TextInput
                            placeholder="Mot de passe"
                            icon={PasswordIcon}
                            register={register}
                            name="password"
                            isPassword
                        />
                <Button text="Connexion" />
            </form>
        </div>
    );
}

export default Home;
