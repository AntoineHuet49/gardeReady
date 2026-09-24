import { UseFormRegister } from "react-hook-form";
import { VerificationValues } from "../../Types/formValues";

type RadioInputProps = {
    register: UseFormRegister<VerificationValues[]>;
    name: `${number}` | `${number}.elementId` | `${number}.status` | `${number}.comment`;
};

function RadioInput({ register, name }: RadioInputProps) {
    return (
        <div className="join justify-end">
            <input
                className="join-item btn min-h-11 min-w-16 checked:btn-success"
                type="radio"
                aria-label="OK"
                {...register(name, { required: true })}
                value="OK"
                />
            <input
                className="join-item btn min-h-11 min-w-16 checked:btn-error"
                type="radio"
                aria-label="KO"
                {...register(name, { required: true })}
                value="KO"
                />
        </div>
    );
}

export default RadioInput;
