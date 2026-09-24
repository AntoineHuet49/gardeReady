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

const countElements = (sections: Section[] = []): number =>
    sections.reduce(
        (total, section) =>
            total + (section.elements?.length ?? 0) + countElements(section.subSections),
        0
    );

type DetailsProps = {
    vehicule?: Vehicule;
    isLoading: boolean;
    error: Error | null;
    register: UseFormRegister<VerificationValues[]>;
    handleSubmit: UseFormHandleSubmit<VerificationValues[]>;
    onSubmit: (data: VerificationValues[]) => void;
    isPending: boolean;
    watch: UseFormWatch<VerificationValues[]>;
};

function Verifications({
    vehicule,
    isLoading,
    error,
    register,
    handleSubmit,
    onSubmit,
    isPending,
    watch,
}: DetailsProps) {
    const total = countElements(vehicule?.sections);
    const checked = Object.values(watch() ?? {}).filter((value) => value?.status).length;
    const remaining = total - checked;

    return (
        <div className="container flex flex-col items-center p-4">
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
                        {total > 0 ? (
                            vehicule!.sections!.map((section: Section) => (
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
                        {total > 0 && (
                            <div className="sticky bottom-0 w-full flex items-center gap-3 py-3 bg-base-100 border-t border-base-300">
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm">
                                        {checked}/{total} éléments vérifiés
                                    </p>
                                    <progress
                                        className="progress progress-success w-full"
                                        value={checked}
                                        max={total}
                                        aria-label="Progression de la vérification"
                                    />
                                </div>
                                <Button
                                    className="px-10"
                                    text={isPending ? "Envoi..." : "Valider"}
                                    disabled={remaining > 0 || isPending}
                                    title={remaining > 0 ? `${remaining} élément(s) restant(s) à vérifier` : undefined}
                                />
                            </div>
                        )}
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
