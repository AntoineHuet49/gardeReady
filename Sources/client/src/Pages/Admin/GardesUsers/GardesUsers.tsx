import Loader from "../../../Components/Loader/Loader";
import { Garde } from "../../../Types/Garde";
import { User } from "../../../Types/User";
import GardeCard from "./GardeCard";
import AddUserModal from "../Users/AddUserModal/AddUserModal";
import AddGardeModal from "./AddGardeModal/AddGardeModal";

type GardesUsersProps = {
    gardes?: Garde[];
    usersByGarde: Record<number, User[]>;
    allUsers: User[];
    isLoading: boolean;
    error: Error | null;
};

function GardesUsers({ gardes, usersByGarde, allUsers, isLoading }: GardesUsersProps) {
    // Récupérer les utilisateurs non assignés à une garde
    const unassignedUsers = allUsers.filter(user => !user.garde_id);

    return (
        <>
            {isLoading && <Loader />}
            
            {/* Boutons pour ajouter une garde et un utilisateur */}
            <div className="flex justify-end gap-2 mb-4">
                <AddGardeModal buttonText="+ Ajouter une garde" />
                <AddUserModal buttonText="+ Ajouter un utilisateur" />
            </div>

            {/* Cards des gardes */}
            {gardes && gardes.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {gardes.map((garde) => (
                        <GardeCard
                            key={garde.id}
                            garde={garde}
                            users={usersByGarde[garde.id] || []}
                            allUsers={allUsers}
                        />
                    ))}
                </div>
            )}

            {/* Card pour les utilisateurs non assignés */}
            {unassignedUsers.length > 0 && (
                <div className="mt-4">
                    <div className="card bg-base-100 border border-base-content/10 shadow-sm">
                        <div className="card-body">
                            <h3 className="card-title text-warning">
                                ⚠️ Utilisateurs non assignés à une garde
                            </h3>
                            <ul className="space-y-2 mt-2">
                                {unassignedUsers.map((user) => (
                                    <li 
                                        key={user.id}
                                        className="text-sm"
                                    >
                                        • {user.firstname} {user.lastname}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

export default GardesUsers;
