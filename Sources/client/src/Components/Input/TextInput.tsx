import { FieldApi } from "@tanstack/react-form";
import { FormName, FormValues } from "../../Types/formValues";

type TextInputProps<Name extends FormName> = {
    icon?: string;
    placeholder: string;
    isPassword?: boolean;
    field: FieldApi<FormValues, Name>
};

function TextInput<Name extends FormName>({ icon, placeholder, isPassword, field }: TextInputProps<Name>) {
    return (
        <label className="input input-bordered flex items-center gap-2 mb-4">
            {icon !== undefined ? (
                <img className="w-full h-1/2" src={icon} />
            ) : undefined}
            <input
                type={isPassword ? "password" : "text"}
                className="grow"
                placeholder={placeholder}
                name={field?.name}
                value={field?.state.value}
                onBlur={field?.handleBlur}
                onChange={(e) => {
                    const newValue = e.target.value;
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    field.handleChange(() => newValue as any);
                }}
            />
        </label>
    );
}

export default TextInput;
