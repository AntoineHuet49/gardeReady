import { FieldValues, Path, UseFormRegister } from "react-hook-form";

type TextInputProps<T extends FieldValues> = {
    icon?: string;
    placeholder: string;
    isPassword?: boolean;
    register: UseFormRegister<T>;
    name: Path<T>;
};

function TextInput<T extends FieldValues>({ icon, placeholder, isPassword, register, name }: TextInputProps<T>) {
    return (
        <label className="input input-bordered flex items-center gap-2 mb-4 over w-full">
            {icon !== undefined ? (
                <img className="h-1/2" src={icon} />
            ) : undefined}
            <input
                type={isPassword ? "password" : "text"}
                className="grow w-3/4"
                placeholder={placeholder}
                {...register(name)}
            />
        </label>
    );
}

export default TextInput;
