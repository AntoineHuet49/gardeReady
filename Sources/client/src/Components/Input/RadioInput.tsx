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
                className="join-item btn checked:btn-success"
                type="radio"
                aria-label="OK"
                {...register(name)}
                value="OK"
                />
            <input
                className="join-item btn checked:btn-error"
                type="radio"
                aria-label="KO"
                {...register(name)}
                value="KO"
                defaultChecked
                />
        </div>
    );
}

export default RadioInput;
