import { useForm } from "react-hook-form";
import Button from "../../Components/Button/button";
import TextInput from "../../Components/Input/TextInput";
import PasswordIcon from "../../assets/icons/password.svg";
import { SetPasswordValues } from "../../Types/formValues";
import { useAuthMutations } from "../../hooks/useAuthMutations";

type SetPasswordFormProps = {
    token: string;
    onDone: () => void;
};

// Page atteinte via le lien d'invitation envoyé par e-mail à la création du compte
function SetPasswordForm({ token, onDone }: SetPasswordFormProps) {
    const { setPasswordMutation } = useAuthMutations();
    const {
        register,
        handleSubmit,
        getValues,
        formState: { errors },
    } = useForm<SetPasswordValues>();

    const handleSubmitForm = async ({ password }: SetPasswordValues) => {
        await setPasswordMutation.mutateAsync({ token, password });
        onDone();
    };

    return (
        <div className="container flex flex-col items-center justify-center h-screen">
            <h1 className="text-4xl sm:text-5xl md:text-6xl mb-10">Véri'Feu</h1>
            <form
                className="bg-base p-5 w-3/4 lg:w-1/2 xl:w-1/3 flex flex-col border-2 border-base-300 rounded-lg"
                onSubmit={handleSubmit((data) => handleSubmitForm(data).catch(() => undefined))}
            >
                <h2 className="text-3xl mb-4">Définir mon mot de passe</h2>
                <TextInput
                    placeholder="Mot de passe"
                    icon={PasswordIcon}
                    register={register}
                    name="password"
                    isPassword
                    errors={errors}
                    options={{
                        required: "Veuillez entrer un mot de passe",
                        pattern: {
                            value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/,
                            message:
                                "Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule et un chiffre",
                        },
                    }}
                />
                <TextInput
                    placeholder="Confirmer le mot de passe"
                    icon={PasswordIcon}
                    register={register}
                    name="passwordConfirmation"
                    isPassword
                    errors={errors}
                    options={{
                        required: "Veuillez confirmer le mot de passe",
                        validate: (value) =>
                            value === getValues("password") || "Les mots de passe ne correspondent pas",
                    }}
                />
                <Button text="Valider" className="btn-primary" disabled={setPasswordMutation.isPending} />
            </form>
        </div>
    );
}

export default SetPasswordForm;
