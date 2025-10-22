import { useForm } from "react-hook-form";
import { useElementMutations } from "../../hooks/useElementMutations";
import Button from "../Button/button";
import TextInput from "../Input/TextInput";

type AddElementModalProps = {
    isOpen: boolean;
    onClose: () => void;
    sectionId: number;
    sectionName: string;
};

type FormData = {
    name: string;
};

const AddElementModal = ({ isOpen, onClose, sectionId, sectionName }: AddElementModalProps) => {
    const { createElementMutation } = useElementMutations();
    
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors }
    } = useForm<FormData>();

    const onSubmit = (data: FormData) => {
        createElementMutation.mutate({
            name: data.name,
            section_id: sectionId
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
                    <h3 className="text-lg font-semibold">Ajouter un équipement</h3>
                    <button
                        onClick={handleClose}
                        className="text-gray-500 hover:text-gray-700"
                    >
                        ✕
                    </button>
                </div>
                
                <p className="text-sm text-gray-600 mb-4">
                    Section : <strong>{sectionName}</strong>
                </p>

                <form onSubmit={handleSubmit(onSubmit)}>
                    <div className="mb-4">
                        <TextInput
                            placeholder="Ex: Stéthoscope, Masque, etc."
                            register={register}
                            name="name"
                            required
                            options={{
                                required: "Le nom de l'équipement est requis",
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
                            disabled={createElementMutation.isPending}
                        >
                            Annuler
                        </button>
                        <Button
                            text={createElementMutation.isPending ? "Création..." : "Créer"}
                            type="submit"
                            disabled={createElementMutation.isPending}
                            className="px-4 py-2"
                        />
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddElementModal;