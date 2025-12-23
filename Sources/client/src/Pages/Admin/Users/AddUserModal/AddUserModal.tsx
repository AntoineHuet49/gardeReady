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
        onSuccess: () => {
            toast.success("Utilisateur créé avec succès !");
            reset();
            queryClient.invalidateQueries({ queryKey: ["users"] });
            (document.getElementById(modalId) as HTMLDialogElement)?.close();
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

    const handleSubmitForm = async (data: UsersValues) => {
        // Vérification que les mots de passe correspondent
        if (data.password !== data.passwordConfirmation) {
            toast.error("Les mots de passe ne correspondent pas");
            return;
        }

        // Préparation des données pour l'API
        const userData = {
            email: data.email,
            password: data.password,
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
                        <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">
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
                        <TextInput
                            register={register}
                            placeholder="Mot de passe"
                            name="password"
                            isPassword
                            errors={errors}
                            options={{
                                required: "Veuillez entrer un mot de passe",
                                pattern: {
                                    value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/,
                                    message:
                                        "Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule et un chiffre",
                                },
                            }}
                        />
                        <TextInput
                            register={register}
                            placeholder="Confirmer le Mot de passe"
                            name="passwordConfirmation"
                            isPassword
                            errors={errors}
                            options={{
                                required: "Veuillez confirmer le mot de passe",
                            }}
                        />
                        <DropdownInput
                            register={register}
                            name="role"
                            options={{ User: "user", Admin: "admin" }}
                        />
                        <DropdownInput
                            register={register}
                            name="garde_id"
                            options={gardesOptions}
                        />
                        <Button type="submit" className="btn-primary" text="Ajouter" />
                        <Button
                            text={"Annuler"}
                            className="ml-2 btn"
                            onClick={(e) => {
                                e.preventDefault();
                                (document.getElementById(
                                    modalId
                                ) as HTMLDialogElement)!.close();
                            }}
                        />
                    </form>
                </div>
            </dialog>
        </>
    );
}
export default AddUserModal;
