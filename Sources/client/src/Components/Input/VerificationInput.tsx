import { UseFormRegister } from "react-hook-form";
import RadioInput from "./RadioInput";
import { Element } from "../../Types/Element";
import { VerificationValues } from "../../Types/formValues";

type VerificationInputProps = {
    element: Element;
    currentStatus?: VerificationValues["status"];
    register: UseFormRegister<VerificationValues[]>;
};

const VerificationInput = ({ element, currentStatus, register }: VerificationInputProps) => {
    return (
        <div key={element.id} className="w-full">
            <div className="">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between w-full mb-4">
                    <h3 className="text-xl break-words min-w-0">
                        {element.quantite > 1 && <strong>{element.quantite} </strong>}
                        {element.name}
                    </h3>
                    <input
                        type="hidden"
                        {...register(`${element.id}.elementId`)}
                        value={element.id}
                    />
                    <RadioInput
                        name={`${element.id}.status`}
                        register={register}
                    />
                </div>
                {currentStatus === "KO" && (
                    <textarea
                        className="textarea textarea-bordered textarea-md w-full"
                        placeholder="Commentaire"
                        aria-label={`Commentaire pour ${element.name}`}
                        style={{ resize: "none" }}
                        {...register(`${element.id}.comment`)}
                        required
                    ></textarea>
                )}
            </div>
        </div>
    );
};

export default VerificationInput;
