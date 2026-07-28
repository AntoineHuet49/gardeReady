import { useQuery } from "@tanstack/react-query";
import { getAuthProvider } from "../App/utils/Api/Auth";

export const useAuthProvider = () => {
    const { data, isLoading, error } = useQuery({
        queryKey: ["authProvider"],
        queryFn: () => getAuthProvider(),
    });

    return { provider: data, isLoading, error };
};
