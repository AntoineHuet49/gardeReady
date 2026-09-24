import { useForm } from "react-hook-form";
import Button from "../../../../Components/Button/button";
import { UsersValues } from "../../../../Types/formValues";
import TextInput from "../../../../Components/Input/TextInput";
import DropdownInput from "../../../../Components/Input/DropdownInput";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getAllGardes } from "../../../../App/utils/Api/Gardes";
import { createUser } from "../../../../App/utils/Api/Users";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

type AddUserModalProps = {
    buttonText: string;
    defaultGardeId?: number;
};

function AddUserModal({ buttonText, defaultGardeId }: AddUserModalProps) {
    const [gardesOptions, setGardesOptions] = useState<Record<string, number>>(
        {}
    );

    const modalId = defaultGardeId ? `add-user-modal-${defaultGardeId}` : "add-user-modal";
    const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<UsersValues>();
    const queryClient = useQueryClient();

    const gardes = useQuery({
        queryKey: ["gardes"],
        queryFn: getAllGardes,
    }).data;

    const createUserMutation = useMutation({
        mutationFn: createUser,
        onSuccess: (response) => {
            // invitationSent : null en login Microsoft (pas d'invitation), false si l'e-mail n'est pas parti
            const { invitationSent } = response.data as { invitationSent: boolean | null };
            if (invitationSent === false) {
                toast.warning("Utilisateur créé, mais l'e-mail d'invitation n'a pas pu être envoyé.");
            } else if (invitationSent) {
                toast.success("Utilisateur créé : un e-mail lui a été envoyé pour définir son mot de passe.");
            } else {
                toast.success("Utilisateur créé avec succès !");
            }
            queryClient.invalidateQueries({ queryKey: ["users"] });
            handleClose();
        },
        onError: (error: Error & { response?: { data?: { message?: string } } }) => {
            const errorMessage = error.response?.data?.message || "Erreur lors de la création de l'utilisateur";
            toast.error(errorMessage);
        },
    });

    useEffect(() => {
        if (gardes) {
            const sortedGardes = [...gardes].sort((a, b) => a.numero - b.numero);
            setGardesOptions(
                sortedGardes.reduce((acc, garde) => {
                    acc[`Garde ${garde.numero}`] = garde.id;
                    return acc;
                }, {} as Record<string, number>)
            );
        }
    }, [gardes]);

    // Pré-sélectionner la garde si defaultGardeId est fourni
    useEffect(() => {
        if (defaultGardeId) {
            setValue("garde_id", defaultGardeId);
        }
    }, [defaultGardeId, setValue]);

    const handleClose = () => {
        reset();
        (document.getElementById(modalId) as HTMLDialogElement)?.close();
    };

    const handleSubmitForm = async (data: UsersValues) => {
        // Pas de mot de passe : en login local, l'utilisateur reçoit un e-mail pour le définir lui-même
        const userData = {
            email: data.email,
            firstname: data.firstname,
            lastname: data.lastname,
            role: data.role,
            garde_id: Number(data.garde_id),
        };

        createUserMutation.mutate(userData);
    };

    return (
        <>
            <Button
                text={buttonText}
                className="btn-primary"
                onClick={() =>
                    (document.getElementById(
                        modalId
                    ) as HTMLDialogElement)!.showModal()
                }
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
                        Ajouter un utilisateur
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
                            name="role"
                            label="Rôle"
                            options={{ User: "user", Admin: "admin" }}
                        />
                        <DropdownInput
                            register={register}
                            name="garde_id"
                            label="Garde"
                            options={gardesOptions}
                        />
                        <Button type="submit" className="btn-primary" text="Ajouter" disabled={createUserMutation.isPending} />
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
export default AddUserModal;
