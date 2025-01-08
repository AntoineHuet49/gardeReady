import {
    UseFormHandleSubmit,
    UseFormRegister,
    UseFormWatch,
} from "react-hook-form";
import Alert from "../../Components/Alert/Alert";
import Button from "../../Components/Button/button";
import RadioInput from "../../Components/Input/RadioInput";
import Loader from "../../Components/Loader/Loader";
import { Element } from "../../Types/Element";
import { Vehicule } from "../../Types/Vehicule";
import { VerificationValues } from "../../Types/formValues";
import BackButton from "../../Components/Button/backButton";

type DetailsProps = {
    vehicule?: Vehicule;
    isLoading: boolean;
    error: Error | null;
    register: UseFormRegister<VerificationValues[]>;
    handleSubmit: UseFormHandleSubmit<VerificationValues[]>;
    onSubmit: (data: VerificationValues[]) => void;
    watch: UseFormWatch<VerificationValues[]>;
};

function Verifications({
    vehicule,
    isLoading,
    error,
    register,
    handleSubmit,
    onSubmit,
    watch,
}: DetailsProps) {
    return (
        <div className="container flex flex-col items-center p-4">
            <h1 className="text-5xl m-10">Verifications</h1>
            {isLoading ? <Loader /> : undefined}
            {!error && !isLoading ? (
                <div className="flex flex-col items-center justify-center w-full p-6">
                    <div className="flex w-full">
                        <BackButton />
                        <h2 className="text-xl font-bold flex-grow text-center">
                            {vehicule?.name.toLocaleUpperCase()}
                        </h2>
                    </div>
                    <div className="divider"></div>
                    <form
                        onSubmit={handleSubmit(onSubmit)}
                        className="flex flex-col items-start w-full"
                    >
                        {vehicule?.elements?.map((element: Element) => {
                            const currentStatus =
                                watch(`${element.id}.status`) || "KO";
                            return (
                                <div key={element.id} className="w-full">
                                    <div className="">
                                        <div className="flex justify-between w-full mb-4">
                                            <h3 className="text-xl">
                                                {element.name}
                                            </h3>
                                            <input
                                                type="hidden"
                                                {...register(
                                                    `${element.id}.elementId`
                                                )}
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
                                                style={{ resize: "none" }}
                                                {...register(
                                                    `${element.id}.comment`
                                                )}
                                                required
                                            ></textarea>
                                        )}
                                    </div>
                                    <div className="divider"></div>
                                </div>
                            );
                        })}
                        <Button className="self-end px-10" text="Valider" />
                    </form>
                </div>
            ) : undefined}
            {error ? (
                <Alert
                    type="error"
                    display={true}
                    message="Aucun vehicule n'a été trouvé"
                />
            ) : undefined}
        </div>
    );
}

export default Verifications;
