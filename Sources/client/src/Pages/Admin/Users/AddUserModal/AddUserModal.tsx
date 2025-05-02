import { useForm } from "react-hook-form";
import Button from "../../../../Components/Button/button";
import { UsersValues } from "../../../../Types/formValues";
import TextInput from "../../../../Components/Input/TextInput";
import DropdownInput from "../../../../Components/Input/DropdownInput";

type AddUserModalProps = {
    buttonText: string;
};

function AddUserModal({ buttonText }: AddUserModalProps) {
    const modalId = "add-user-modal";
    const { register } = useForm<UsersValues>();

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
                    <form>
                        <TextInput
                            register={register}
                            placeholder="E-mail"
                            name="email"
                        />
                        <TextInput
                            register={register}
                            placeholder="Prénom"
                            name="firstname"
                        />
                        <TextInput
                            register={register}
                            placeholder="Nom"
                            name="lastname"
                        />
                        <TextInput
                            register={register}
                            placeholder="Mot de passe"
                            name="password"
                            isPassword
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
                            options={{ "Garde 1": 0, "Garde 2": 1 }}
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
