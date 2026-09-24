import { useState } from "react";
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
    type = "text",
    register,
    name,
    required,
    options,
    errors,
}: TextInputProps<T>) {
    const error = errors?.[name];
    const [showPassword, setShowPassword] = useState(false);

    return (
        <>
            <label className={`input input-bordered flex items-center gap-2 mb-1 over w-full ${error ? 'input-error' : ''}`}>
                {icon !== undefined ? (
                    <img className="h-1/2" src={icon} alt="" />
                ) : undefined}
                <input
                    type={isPassword ? (showPassword ? "text" : "password") : type}
                    className="grow w-3/4"
                    placeholder={placeholder}
                    aria-label={placeholder}
                    {...register(name, options)}
                    required={required}
                />
                {isPassword && (
                    <button
                        type="button"
                        className="btn btn-ghost btn-sm btn-square"
                        aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                        aria-pressed={showPassword}
                        onClick={() => setShowPassword((show) => !show)}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                            <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12Z" />
                            <circle cx="12" cy="12" r="3" />
                            {showPassword && <path d="M3 3l18 18" />}
                        </svg>
                    </button>
                )}
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
