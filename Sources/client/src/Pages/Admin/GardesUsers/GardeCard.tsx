import { Garde } from "../../../Types/Garde";
import { User } from "../../../Types/User";
import { useUser } from "../../../App/Provider/UserProvider";
import { useGardeMutations } from "../../../hooks/useGardeMutations";
import Button from "../../../Components/Button/button";

type GardeCardProps = {
    garde: Garde;
    users: User[];
    allUsers: User[];
};

function GardeCard({ garde, users }: GardeCardProps) {
    const { isSuperAdmin } = useUser();
    const { deleteGarde } = useGardeMutations();

    // Filtrer les utilisateurs : les admins normaux ne voient pas les superAdmin
    const filteredUsers = users.filter(user => {
        if (isSuperAdmin) {
            return true;
        } else {
            return user.role !== "superAdmin";
        }
    });

    // Trouver le responsable
    const responsable = garde.responsableUser;

    const handleDelete = () => {
        if (window.confirm(`Êtes-vous sûr de vouloir supprimer la Garde ${garde.numero} ? Cette action est irréversible.`)) {
            deleteGarde.mutate(garde.id);
        }
    };

    return (
        <div 
            className="card bg-base-100 border border-base-content/10 shadow-sm"
            style={{ borderLeftWidth: '4px', borderLeftColor: garde.color }}
        >
            <div className="card-body">
                {/* Header avec titre et bouton de suppression */}
                <div className="flex justify-between items-center">
                    <h2 className="card-title text-2xl">
                        Garde {garde.numero}
                    </h2>
                    <Button
                        text={deleteGarde.isPending ? "..." : "✕"}
                        onClick={handleDelete}
                        className="btn-xs bg-red-100 text-red-700 border-red-200 hover:bg-red-200"
                        title="Supprimer cette garde"
                        disabled={deleteGarde.isPending}
                    />
                </div>

                {/* Responsable */}
                {responsable ? (
                    <div className="mt-2">
                        <span className="font-semibold">Responsable : </span>
                        <span>{responsable.firstname} {responsable.lastname}</span>
                    </div>
                ) : (
                    <div className="mt-2 text-sm text-warning italic">
                        Aucun responsable assigné
                    </div>
                )}

                {/* Liste des membres */}
                <div className="mt-4">
                    <h3 className="font-semibold mb-2">
                        Membres ({filteredUsers.length}) :
                    </h3>
                    {filteredUsers.length > 0 ? (
                        <ul className="space-y-2">
                            {filteredUsers.map((user) => (
                                <li 
                                    key={user.id}
                                    className="text-sm"
                                >
                                    • {user.firstname} {user.lastname}
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-sm text-base-content/60 italic">
                            Aucun membre dans cette garde
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}

export default GardeCard;
