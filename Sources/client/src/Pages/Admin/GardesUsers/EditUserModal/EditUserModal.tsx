import { useForm } from "react-hook-form";
import Button from "../../../../Components/Button/button";
import TextInput from "../../../../Components/Input/TextInput";
import { User } from "../../../../Types/User";
import { UpdateUserData } from "../../../../App/utils/Api/Users";
import { useAuthMutations } from "../../../../hooks/useAuthMutations";

type EditUserModalProps = {
    user: User;
};

function EditUserModal({ user }: EditUserModalProps) {
    const modalId = `edit-user-modal-${user.id}`;
    const { register, handleSubmit, reset, formState: { errors } } = useForm<UpdateUserData>({
        defaultValues: {
            email: user.email,
            firstname: user.firstname,
            lastname: user.lastname,
        },
    });
    const { updateUserMutation } = useAuthMutations();

    const handleClose = () => {
        reset({ email: user.email, firstname: user.firstname, lastname: user.lastname });
        (document.getElementById(modalId) as HTMLDialogElement)?.close();
    };

    const handleOpen = () => {
        reset({ email: user.email, firstname: user.firstname, lastname: user.lastname });
        (document.getElementById(modalId) as HTMLDialogElement)?.showModal();
    };

    const handleSubmitForm = (data: UpdateUserData) => {
        updateUserMutation.mutate(
            { userId: user.id, data },
            { onSuccess: handleClose }
        );
    };

    return (
        <>
            <Button
                text="✎"
                onClick={handleOpen}
                className="btn-xs bg-base-200 hover:bg-base-300"
                title="Modifier cet utilisateur"
            />
            <dialog id={modalId} className="modal">
                <div className="modal-box">
                    <form method="dialog">
                        <button
                            className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
                            onClick={handleClose}
                        >
                            ✕
                        </button>
                    </form>
                    <h3 className="font-bold text-lg mb-6">
                        Modifier l'utilisateur
                    </h3>
                    <form onSubmit={handleSubmit(handleSubmitForm)}>
                        <TextInput
                            register={register}
                            placeholder="E-mail"
                            name="email"
                            type="email"
                            errors={errors}
                            options={{
                                required: "Veuillez entrer un e-mail",
                                pattern: {
                                    value: /^[\w-.]+@sdis49.fr$/,
                                    message:
                                        "Veuillez entrer un e-mail du sdis49",
                                },
                            }}
                        />
                        <TextInput
                            register={register}
                            placeholder="Prénom"
                            name="firstname"
                            errors={errors}
                            options={{
                                required: "Veuillez entrer un prénom",
                            }}
                        />
                        <TextInput
                            register={register}
                            placeholder="Nom"
                            name="lastname"
                            errors={errors}
                            options={{
                                required: "Veuillez entrer un nom",
                            }}
                        />
                        <Button
                            type="submit"
                            className="btn-primary"
                            text={updateUserMutation.isPending ? "..." : "Enregistrer"}
                            disabled={updateUserMutation.isPending}
                        />
                        <Button
                            text={"Annuler"}
                            className="ml-2 btn"
                            onClick={(e) => {
                                e.preventDefault();
                                handleClose();
                            }}
                        />
                    </form>
                </div>
            </dialog>
        </>
    );
}

export default EditUserModal;
