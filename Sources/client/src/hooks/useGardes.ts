import { useQuery } from "@tanstack/react-query";
import { getAllGardes } from "../App/utils/Api/Gardes";

export const useGardes = () => {
    const { data, isLoading, error } = useQuery({
        queryKey: ["gardes"],
        queryFn: () => getAllGardes(),
    });

    return { gardes: data, isLoading, error };
};
