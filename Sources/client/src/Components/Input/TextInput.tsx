import { FieldValues, Path, RegisterOptions, UseFormRegister } from "react-hook-form";

type TextInputProps<T extends FieldValues> = {
    icon?: string;
    placeholder: string;
    isPassword?: boolean;
    register: UseFormRegister<T>;
    name: Path<T>;
    options?: RegisterOptions<T, Path<T>>;
} & React.InputHTMLAttributes<HTMLInputElement>;

function TextInput<T extends FieldValues>({ icon, placeholder, isPassword, register, name, required, options }: TextInputProps<T>) {
    return (
        <label className="input input-bordered flex items-center gap-2 mb-4 over w-full">
            {icon !== undefined ? (
                <img className="h-1/2" src={icon} />
            ) : undefined}
            <input
                type={isPassword ? "password" : "text"}
                className="grow w-3/4"
                placeholder={placeholder}
                {...register(name, options)}
                required={required}
            />
        </label>
    );
}

export default TextInput;
