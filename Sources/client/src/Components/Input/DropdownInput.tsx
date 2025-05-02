import { FieldValues, Path, UseFormRegister } from "react-hook-form";

type DropdownInputProps<T extends FieldValues> = {
    options: Record<string, string | number>;
    register: UseFormRegister<T>;
    name: Path<T>;
};

function DropdownInput<T extends FieldValues>({ options, register, name }: DropdownInputProps<T>) {
    const optionsArray = Object.entries(options);

    return (
        <div className="mb-4 over w-full">
            {(options && optionsArray.length > 0) && 
            <select
            defaultValue={optionsArray[0][0]}
            {...register(name)}
            className="select w-full"
            >
                {optionsArray.map((option, index) => (
                    <option key={index} value={option[1]}>
                        {option[0]}
                    </option>
                ))}
            </select>
            }
        </div>
    );
}

export default DropdownInput;
