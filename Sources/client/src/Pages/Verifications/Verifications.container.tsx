import { useQuery } from "@tanstack/react-query";
import Details from "./Verifications";
import { getVehiculeById } from "../../utils/Api/Vehicules";
import { useParams } from "react-router";
import { useForm } from "react-hook-form";
import { VerificationValues } from "../../Types/formValues";
import { useMemo } from "react";
import { Element } from "../../Types/Element";

function VerificationsContainer() {
    let elements: Element[] = [];
    const { id } = useParams();
    const { data, isLoading, error } = useQuery({
        queryKey: ["details"],
        queryFn: () => getVehiculeById(id!),
    });

    useMemo(() => {
        if (data?.data.elements !== undefined) {
            // eslint-disable-next-line react-hooks/exhaustive-deps
            elements = data?.data.elements;
        }
    }, [data?.data.elements]);

    const defaultValues: VerificationValues[] = elements.map((element) => ({
        elementId: element.id,
        status: "KO",
        comment: "",
    }));

    const { register, handleSubmit, watch } = useForm<VerificationValues[]>({
        shouldUnregister: true,
        defaultValues: defaultValues
    });

    const onSubmit = async (data: VerificationValues[]) => {
        console.log(data);
    };

    return (
        <Details
            vehicule={data?.data}
            isLoading={isLoading}
            error={error}
            register={register}
            handleSubmit={handleSubmit}
            onSubmit={onSubmit}
            watch={watch}
        />
    );
}

export default VerificationsContainer;
