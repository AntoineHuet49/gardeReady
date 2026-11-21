import { createPortal } from "react-dom";
import { useForm } from "react-hook-form";
import Button from "../../../../Components/Button/button";
import TextInput from "../../../../Components/Input/TextInput";
import { User } from "../../../../Types/User";
import { UpdateUserData } from "../../../../App/utils/Api/Users";
import DropdownInput from "../../../../Components/Input/DropdownInput";
import { useAuthMutations } from "../../../../hooks/useAuthMutations";
import { useQuery } from "@tanstack/react-query";
import { getAllGardes } from "../../../../App/utils/Api/Gardes";

type EditUserForm = UpdateUserData & { garde_id: string };

type EditUserModalProps = {
    user: User;
};

function EditUserModal({ user }: EditUserModalProps) {
    const modalId = `edit-user-modal-${user.id}`;
    const initialValues = () => ({
        email: user.email,
        firstname: user.firstname,
        lastname: user.lastname,
        garde_id: user.garde_id ? String(user.garde_id) : "",
    });
    const { register, handleSubmit, reset, formState: { errors } } = useForm<EditUserForm>({
        defaultValues: initialValues(),
    });
    const { updateUserMutation, updateGardeMutation } = useAuthMutations();
    const { data: gardes } = useQuery({ queryKey: ["gardes"], queryFn: getAllGardes });
    const gardesOptions: Record<string, string> = { "Aucune garde": "" };
    [...(gardes ?? [])].sort((a, b) => a.numero - b.numero).forEach((g) => {
        gardesOptions[`Garde ${g.numero}`] = String(g.id);
    });

    const handleClose = () => {
        reset(initialValues());
        (document.getElementById(modalId) as HTMLDialogElement)?.close();
    };

    const handleOpen = () => {
        reset(initialValues());
        (document.getElementById(modalId) as HTMLDialogElement)?.showModal();
    };

    const handleSubmitForm = ({ garde_id, ...data }: EditUserForm) => {
        const newGardeId = garde_id ? Number(garde_id) : null;
        updateUserMutation.mutate(
            { userId: user.id, data },
            {
                onSuccess: () => {
                    if (newGardeId !== (user.garde_id ?? null)) {
                        updateGardeMutation.mutate({ userId: user.id, gardeId: newGardeId });
                    }
                    handleClose();
                },
            }
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
            {createPortal(
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
                        <DropdownInput
                            register={register}
                            name="garde_id"
                            label="Garde"
                            options={gardesOptions}
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
            </dialog>,
            document.body
            )}
        </>
    );
}

export default EditUserModal;
