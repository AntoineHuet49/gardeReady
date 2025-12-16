import { useForm } from "react-hook-form";
import { useEffect } from "react";
import { useVehiculeMutations } from "../../hooks/useVehiculeMutations";
import Button from "../Button/button";
import TextInput from "../Input/TextInput";

type AddVehiculeModalProps = {
    isOpen: boolean;
    onClose: () => void;
};

type FormData = {
    name: string;
};

const AddVehiculeModal = ({ 
    isOpen, 
    onClose
}: AddVehiculeModalProps) => {
    const { createVehiculeMutation } = useVehiculeMutations();
    
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
            setTimeout(() => {
                setFocus("name");
            }, 100);
        }
    }, [isOpen, setFocus]);

    const onSubmit = (data: FormData) => {
        createVehiculeMutation.mutate(
            { name: data.name },
            {
                onSuccess: () => {
                    reset();
                    onClose();
                }
            }
        );
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
                    <h3 className="text-lg font-semibold">Ajouter un véhicule</h3>
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
                            text={createVehiculeMutation.isPending ? "Création..." : "Créer"}
                            type="submit"
                            disabled={createVehiculeMutation.isPending}
                            className="btn btn-primary"
                        />
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddVehiculeModal;
