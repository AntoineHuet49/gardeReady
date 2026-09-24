import { useForm } from "react-hook-form";
import { useEffect } from "react";
import { useElementMutations } from "../../hooks/useElementMutations";
import Button from "../Button/button";
import TextInput from "../Input/TextInput";
import { Element } from "../../Types/Element";

type AddElementModalProps = {
    isOpen: boolean;
    onClose: () => void;
    sectionId: number;
    sectionName: string;
    element?: Element; // si fourni : modification de cet équipement
};

type FormData = {
    name: string;
    quantite: number;
};

const AddElementModal = ({ isOpen, onClose, sectionId, sectionName, element }: AddElementModalProps) => {
    const { createElementMutation, updateElementMutation } = useElementMutations();
    const mutation = element ? updateElementMutation : createElementMutation;
    
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
            reset({ name: element?.name ?? "", quantite: element?.quantite ?? 1 });
            // Délai pour que le modal soit complètement rendu
            setTimeout(() => {
                setFocus("name");
            }, 100);
        }
    }, [isOpen, setFocus, reset, element]);

    const onSubmit = (data: FormData) => {
        const options = {
            onSuccess: () => {
                reset();
                onClose();
            }
        };
        if (element) {
            updateElementMutation.mutate({ id: element.id, data: { name: data.name, quantite: data.quantite } }, options);
        } else {
            createElementMutation.mutate({ name: data.name, quantite: data.quantite, section_id: sectionId }, options);
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
                    <h3 className="text-lg font-semibold">{element ? "Modifier l'équipement" : "Ajouter un équipement"}</h3>
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
                        <label className="label text-sm mb-1" htmlFor="element-quantite">Quantité</label>
                        <input
                            id="element-quantite"
                            type="number"
                            min={1}
                            step={1}
                            className={`input input-bordered w-full ${errors.quantite ? 'input-error' : ''}`}
                            {...register("quantite", {
                                valueAsNumber: true,
                                required: "La quantité est requise",
                                min: { value: 1, message: "La quantité doit être au moins 1" },
                                validate: (v) => Number.isInteger(v) || "La quantité doit être un nombre entier",
                            })}
                        />
                        {errors.quantite && (
                            <p className="text-error text-sm mt-1 ml-1">{errors.quantite.message}</p>
                        )}
                    </div>

                    <div className="flex gap-3 justify-end">
                        <button
                            type="button"
                            onClick={handleClose}
                            className="px-4 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-50"
                            disabled={mutation.isPending}
                        >
                            Annuler
                        </button>
                        <Button
                            text={mutation.isPending ? "Enregistrement..." : element ? "Enregistrer" : "Créer"}
                            type="submit"
                            disabled={mutation.isPending}
                            className="px-4 py-2"
                        />
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddElementModal;