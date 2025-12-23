import { useQuery } from "@tanstack/react-query";
import GardesUsers from "./GardesUsers";
import { useGardes } from "../../../hooks/useGardes";
import { getAllUsers } from "../../../App/utils/Api/Users";
import { User } from "../../../Types/User";

function GardesUsersContainer() {
    const { gardes, isLoading: isLoadingGardes, error: gardesError } = useGardes();
    
    const { data: usersData, isLoading: isLoadingUsers, error: usersError } = useQuery({
        queryKey: ["users"],
        queryFn: () => getAllUsers(),
    });

    // Regrouper les utilisateurs par garde_id
    const usersByGarde = usersData?.data?.reduce((acc: Record<number, User[]>, user: User) => {
        const gardeId = user.garde_id;
        if (!acc[gardeId]) {
            acc[gardeId] = [];
        }
        acc[gardeId].push(user);
        return acc;
    }, {} as Record<number, User[]>) || {};

    // Trier les gardes par numéro
    const sortedGardes = gardes ? [...gardes].sort((a, b) => a.numero - b.numero) : [];

    const isLoading = isLoadingGardes || isLoadingUsers;
    const error = gardesError || usersError;

    return (
        <GardesUsers 
            gardes={sortedGardes}
            usersByGarde={usersByGarde}
            allUsers={usersData?.data || []}
            isLoading={isLoading} 
            error={error} 
        />
    );
}

export default GardesUsersContainer;
