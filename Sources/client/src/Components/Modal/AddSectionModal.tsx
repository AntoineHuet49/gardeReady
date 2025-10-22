import { useForm } from "react-hook-form";
import { useEffect } from "react";
import { useSectionMutations } from "../../hooks/useSectionMutations";
import Button from "../Button/button";
import TextInput from "../Input/TextInput";

type AddSectionModalProps = {
    isOpen: boolean;
    onClose: () => void;
    vehiculeId?: number;
    parentSectionId?: number;
    contextName: string; // Nom du véhicule ou de la section parent
};

type FormData = {
    name: string;
};

const AddSectionModal = ({ 
    isOpen, 
    onClose, 
    vehiculeId, 
    parentSectionId, 
    contextName 
}: AddSectionModalProps) => {
    const { createSectionMutation } = useSectionMutations();
    
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
        createSectionMutation.mutate({
            name: data.name,
            vehicule_id: vehiculeId,
            parent_section_id: parentSectionId
        }, {
            onSuccess: () => {
                reset();
                onClose();
            }
        });
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
                    <h3 className="text-lg font-semibold">Ajouter une section</h3>
                    <button
                        onClick={handleClose}
                        className="text-gray-500 hover:text-gray-700"
                    >
                        ✕
                    </button>
                </div>
                
                <p className="text-sm text-gray-600 mb-4">
                    {parentSectionId ? (
                        <>Dans la section : <strong>{contextName}</strong></>
                    ) : (
                        <>Pour le véhicule : <strong>{contextName}</strong></>
                    )}
                </p>

                <form onSubmit={handleSubmit(onSubmit)}>
                    <div className="mb-4">
                        <TextInput
                            placeholder="Ex: Sac de secours, Matériel médical, etc."
                            register={register}
                            name="name"
                            required
                            options={{
                                required: "Le nom de la section est requis",
                                minLength: {
                                    value: 2,
                                    message: "Le nom doit contenir au moins 2 caractères"
                                }
                            }}
                            errors={errors}
                        />
                    </div>

                    <div className="flex gap-3 justify-end">
                        <button
                            type="button"
                            onClick={handleClose}
                            className="px-4 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-50"
                            disabled={createSectionMutation.isPending}
                        >
                            Annuler
                        </button>
                        <Button
                            text={createSectionMutation.isPending ? "Création..." : "Créer"}
                            type="submit"
                            disabled={createSectionMutation.isPending}
                            className="px-4 py-2"
                        />
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddSectionModal;