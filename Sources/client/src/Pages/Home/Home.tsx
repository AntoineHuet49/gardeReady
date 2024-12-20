import { ReactFormExtendedApi } from "@tanstack/react-form";
import Button from "../../Components/Button/button";
import TextInput from "../../Components/Input/TextInput";
import MailIcon from "../../assets/icons/mail.svg";
import PasswordIcon from "../../assets/icons/password.svg";

type HomeProps = {
    handleStartClick: () => void;
    form: ReactFormExtendedApi<
        {
            email: string;
            password: string;
        },
        undefined
    >;
};

function Home({ handleStartClick, form }: HomeProps) {
    return (
        <div className="container flex flex-col items-center justify-center h-screen">
            <h1 id="homeTitle" className="text-6xl mb-20">
                Garde Ready
            </h1>
            <Button
                id="startButton"
                text="Commencer"
                onClick={handleStartClick}
            />
            <form
                id="loginForm"
                className="hero bg-base p-10 w-3/4 h-fit absolute flex flex-col border-2 border-base-300 rounded-lg hidden"
                onSubmit={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    form.handleSubmit();
                }}
            >
                <h2 className="text-3xl mb-8">Login</h2>
                <form.Field
                    name="email"
                    children={(field) => (
                        <TextInput
                            placeholder="email"
                            icon={MailIcon}
                            field={field}
                        />
                    )}
                />
                <form.Field
                    name="password"
                    children={(field) => (
                        <TextInput
                            placeholder="Mot de passe"
                            icon={PasswordIcon}
                            field={field}
                            isPassword
                        />
                    )}
                />
                <Button text="Connexion" />
            </form>
        </div>
    );
}

export default Home;
