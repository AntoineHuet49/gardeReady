import { useForm } from "react-hook-form";
import Button from "../../../../Components/Button/button";
import { UsersValues } from "../../../../Types/formValues";
import TextInput from "../../../../Components/Input/TextInput";
import DropdownInput from "../../../../Components/Input/DropdownInput";
import { useQuery } from "@tanstack/react-query";
import { getAllGardes } from "../../../../App/utils/Api/Gardes";
import { useEffect, useState } from "react";

type AddUserModalProps = {
    buttonText: string;
};

function AddUserModal({ buttonText }: AddUserModalProps) {
    const [gardesOptions, setGardesOptions] = useState<Record<string, number>>(
        {}
    );

    const modalId = "add-user-modal";
    const { register, handleSubmit } = useForm<UsersValues>();

    const gardes = useQuery({
        queryKey: ["gardes"],
        queryFn: getAllGardes,
    }).data;

    useEffect(() => {
        if (gardes) {
            setGardesOptions(
                gardes.reduce((acc, garde) => {
                    acc[garde.name] = garde.id;
                    return acc;
                }, {} as Record<string, number>)
            );
        }
    }, [gardes]);

    const handleSubmitForm = async (data: UsersValues) => {
        console.log(data);
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
                            options={{
                                required: "Veuillez entrer un prénom",
                            }}
                        />
                        <TextInput
                            register={register}
                            placeholder="Nom"
                            name="lastname"
                            options={{
                                required: "Veuillez entrer un nom",
                            }}
                        />
                        <TextInput
                            register={register}
                            placeholder="Mot de passe"
                            name="password"
                            isPassword
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
                        <Button className="btn-primary" text="Ajouter" />
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
