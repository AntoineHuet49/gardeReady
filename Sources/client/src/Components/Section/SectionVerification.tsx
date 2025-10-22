import { UseFormRegister, UseFormWatch } from "react-hook-form";
import { Section } from "../../Types/Section";
import { Element } from "../../Types/Element";
import { VerificationValues } from "../../Types/formValues";
import Collapse from "../Collapse/Collapse";
import VerificationInput from "../Input/VerificationInput";

type SectionVerificationProps = {
    section: Section;
    register: UseFormRegister<VerificationValues[]>;
    watch: UseFormWatch<VerificationValues[]>;
    level?: number;
};

const SectionVerification = ({
    section,
    register,
    watch,
    level = 0,
}: SectionVerificationProps) => {
    const hasElements = section.elements && section.elements.length > 0;
    const hasSubSections =
        section.subSections && section.subSections.length > 0;

    const content = (
        <>
            {/* Éléments de cette section */}
            {hasElements && (
                <div className="space-y-2 mb-4">
                    {section.elements!.map(
                        (element: Element, index: number) => {
                            const currentStatus =
                                watch(`${element.id}.status`) || "KO";
                            const isLastElement =
                                index === section.elements!.length - 1;

                            // Vous pouvez maintenant utiliser isLastElement pour votre logique
                            console.log(
                                `Element ${element.name} is last: ${isLastElement}`
                            );

                            return (
                                <>
                                    <VerificationInput
                                        key={element.id}
                                        element={element}
                                        currentStatus={currentStatus}
                                        register={register}
                                    />
                                    {!isLastElement && (
                                        <div className="divider"></div>
                                    )}
                                </>
                            );
                        }
                    )}
                </div>
            )}

            {/* Sous-sections */}
            {hasSubSections && (
                <div className="space-y-2">
                    {section.subSections!.map((subSection: Section) => (
                        <SectionVerification
                            key={subSection.id}
                            section={subSection}
                            register={register}
                            watch={watch}
                            level={level + 1}
                        />
                    ))}
                </div>
            )}
        </>
    );

    // Si la section n'a ni éléments ni sous-sections, ne rien afficher
    if (!hasElements && !hasSubSections) {
        return null;
    }

    return (
        <div className="w-full">
            <Collapse title={section.name} level={level}>
                {content}
            </Collapse>
        </div>
    );
};

export default SectionVerification;
