import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { getVehiculeAssignments, replaceWeekAssignments } from "../App/utils/Api/VehiculeAssignments";
import { WeekAssignments } from "../Types/Garde";

export const useVehiculeAssignments = (from: string, to: string, enabled = true) => {
    const { data, isLoading, error } = useQuery({
        queryKey: ["vehicule-assignments", from, to],
        queryFn: () => getVehiculeAssignments(from, to),
        enabled,
    });

    return { assignments: data ?? [], isLoading, error };
};

export const useReplaceWeekAssignments = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ shiftDate, assignments }: { shiftDate: string; assignments: WeekAssignments }) =>
            replaceWeekAssignments(shiftDate, assignments),
        onSuccess: () => {
            toast.success("Assignations enregistrées !");
            queryClient.invalidateQueries({ queryKey: ["vehicule-assignments"] });
        },
        onError: (error: Error & { response?: { data?: { message?: string } } }) => {
            toast.error(error.response?.data?.message || "Erreur lors de l'enregistrement des assignations");
        },
    });
};
