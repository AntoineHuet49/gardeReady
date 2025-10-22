import {
    FieldValues,
    Path,
    RegisterOptions,
    UseFormRegister,
    FieldErrors,
} from "react-hook-form";

type TextInputProps<T extends FieldValues> = {
    icon?: string;
    placeholder: string;
    isPassword?: boolean;
    register: UseFormRegister<T>;
    name: Path<T>;
    options?: RegisterOptions<T, Path<T>>;
    errors?: FieldErrors<T>;
} & React.InputHTMLAttributes<HTMLInputElement>;

function TextInput<T extends FieldValues>({
    icon,
    placeholder,
    isPassword,
    register,
    name,
    required,
    options,
    errors,
}: TextInputProps<T>) {
    const error = errors?.[name];

    return (
        <>
            <label className={`input input-bordered flex items-center gap-2 mb-1 over w-full ${error ? 'input-error' : ''}`}>
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
            {error && (
                <p className="text-error text-sm mb-3 ml-1 text-wrap">
                    {String(error.message) || "Ce champ est requis"}
                </p>
            )}
            {!error && <div className="mb-4"></div>}
        </>
    );
}

export default TextInput;
