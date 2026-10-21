import { useForm } from "react-hook-form";
import { useEffect } from "react";
import { useVehiculeMutations } from "../../hooks/useVehiculeMutations";
import Button from "../Button/button";
import TextInput from "../Input/TextInput";

type AddVehiculeModalProps = {
    isOpen: boolean;
    onClose: () => void;
    vehicule?: { id: number; name: string }; // Si fourni : mode édition (renommage)
};

type FormData = {
    name: string;
};

const AddVehiculeModal = ({ 
    isOpen, 
    onClose,
    vehicule
}: AddVehiculeModalProps) => {
    const { createVehiculeMutation, updateVehiculeMutation } = useVehiculeMutations();
    
    const isPending = createVehiculeMutation.isPending || updateVehiculeMutation.isPending;

    const {
        register,
        handleSubmit,
        reset,
        setFocus,
        formState: { errors }
    } = useForm<FormData>();

    // Mettre le focus sur l'input quand le modal s'ouvre
    useEffect(() => {
        if (isOpen) {
            // Délai pour que le modal soit complètement rendu
            reset({ name: vehicule?.name ?? "" });
            setTimeout(() => {
                setFocus("name");
            }, 100);
        }
    }, [isOpen, vehicule, reset, setFocus]);

    const onSubmit = (data: FormData) => {
        const onSuccess = () => {
            reset();
            onClose();
        };
        if (vehicule) {
            updateVehiculeMutation.mutate({ id: vehicule.id, name: data.name }, { onSuccess });
        } else {
            createVehiculeMutation.mutate({ name: data.name }, { onSuccess });
        }
    };

    const handleClose = () => {
        reset();
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold">{vehicule ? "Renommer le véhicule" : "Ajouter un véhicule"}</h3>
                    <button
                        onClick={handleClose}
                        className="text-gray-500 hover:text-gray-700"
                    >
                        ✕
                    </button>
                </div>

                <form onSubmit={handleSubmit(onSubmit)}>
                    <div className="mb-4">
                        <TextInput
                            placeholder="Ex: VSAV01, FPT01"
                            register={register}
                            name="name"
                            required
                            options={{
                                required: "Le nom du véhicule est requis",
                                minLength: {
                                    value: 3,
                                    message: "Le nom doit contenir au moins 3 caractères"
                                }
                            }}
                            errors={errors}
                        />
                    </div>

                    <div className="flex gap-2 justify-end">
                        <Button
                            text="Annuler"
                            onClick={handleClose}
                            type="button"
                            className="btn btn-ghost"
                        />
                        <Button
                            text={isPending ? "Enregistrement..." : vehicule ? "Enregistrer" : "Créer"}
                            type="submit"
                            disabled={isPending}
                            className="btn btn-primary"
                        />
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddVehiculeModal;
