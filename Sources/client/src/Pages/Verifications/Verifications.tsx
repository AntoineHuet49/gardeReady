import {
    UseFormHandleSubmit,
    UseFormRegister,
    UseFormWatch,
} from "react-hook-form";
import Alert from "../../Components/Alert/Alert";
import Button from "../../Components/Button/button";
import Loader from "../../Components/Loader/Loader";
import { Section } from "../../Types/Section";
import { Vehicule } from "../../Types/Vehicule";
import { VerificationValues } from "../../Types/formValues";
import BackButton from "../../Components/Button/backButton";
import SectionVerification from "../../Components/Section/SectionVerification";

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
                <div className="flex flex-col items-center justify-center w-full lg:w-3/4 xl:w-1/2 p-6">
                    <div className="flex w-full">
                        <BackButton />
                        <h2 className="text-xl font-bold flex-grow text-center">
                            {vehicule?.name.toLocaleUpperCase()}
                        </h2>
                    </div>
                    <div className="divider"></div>
                    <form
                        onSubmit={handleSubmit(onSubmit)}
                        className="flex flex-col items-start w-full space-y-4"
                    >
                        {/* Affichage des sections hiérarchiques si disponibles */}
                        {vehicule?.sections && vehicule.sections.length > 0 ? (
                            vehicule.sections.map((section: Section) => (
                                <SectionVerification
                                    key={section.id}
                                    section={section}
                                    register={register}
                                    watch={watch}
                                />
                            ))
                        ) : (
                            /* Aucune section disponible - aucun élément à afficher */
                            <div className="text-center text-gray-500 py-8">
                                Aucun élément de vérification disponible pour ce véhicule.
                            </div>
                        )}
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
