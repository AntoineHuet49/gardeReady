import { useForm } from "react-hook-form";
import Button from "../../../../Components/Button/button";
import TextInput from "../../../../Components/Input/TextInput";
import { useGardeMutations } from "../../../../hooks/useGardeMutations";

type AddGardeModalProps = {
    buttonText: string;
};

type GardeFormValues = {
    numero: number;
    color: string;
};

function AddGardeModal({ buttonText }: AddGardeModalProps) {
    const modalId = "add-garde-modal";
    const { register, handleSubmit, reset, formState: { errors } } = useForm<GardeFormValues>();
    
    const { createGarde } = useGardeMutations();

    const handleSubmitForm = async (data: GardeFormValues) => {
        const gardeData = {
            numero: Number(data.numero),
            color: data.color,
        };

        createGarde.mutate(gardeData, {
            onSuccess: () => {
                reset();
                (document.getElementById(modalId) as HTMLDialogElement)?.close();
            }
        });
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
                        Ajouter une garde
                    </h3>
                    <form onSubmit={handleSubmit(handleSubmitForm)}>
                        <TextInput
                            register={register}
                            placeholder="Numéro de la garde"
                            name="numero"
                            errors={errors}
                            options={{
                                required: "Veuillez entrer un numéro de garde",
                                valueAsNumber: true,
                                validate: {
                                    positive: (value) => Number(value) > 0 || "Le numéro doit être positif",
                                    isInteger: (value) => Number.isInteger(Number(value)) || "Le numéro doit être un entier"
                                }
                            }}
                        />
                        <TextInput
                            register={register}
                            placeholder="Couleur (ex: Rouge, Bleu...)"
                            name="color"
                            errors={errors}
                            options={{
                                required: "Veuillez entrer une couleur",
                            }}
                        />
                        <div className="text-sm text-base-content/60 mb-4 italic">
                            Note : Le responsable pourra être assigné après la création de la garde
                        </div>
                        <Button 
                            type="submit" 
                            className="btn-primary" 
                            text="Ajouter"
                            disabled={createGarde.isPending}
                        />
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

export default AddGardeModal;
