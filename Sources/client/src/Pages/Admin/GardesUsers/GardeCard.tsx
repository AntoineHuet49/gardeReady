import { Garde } from "../../../Types/Garde";
import { User } from "../../../Types/User";
import { useUser } from "../../../App/Provider/UserProvider";
import { useGardeMutations } from "../../../hooks/useGardeMutations";
import { useAuthMutations } from "../../../hooks/useAuthMutations";
import Button from "../../../Components/Button/button";
import { useState, useEffect } from "react";

type GardeCardProps = {
    garde: Garde;
    users: User[];
    allUsers: User[];
};

function GardeCard({ garde, users }: GardeCardProps) {
    const { isSuperAdmin } = useUser();
    const { deleteGarde, updateResponsable } = useGardeMutations();
    const { updateRoleMutation } = useAuthMutations();
    const [openDropdownUserId, setOpenDropdownUserId] = useState<number | null>(null);

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

    const handleResponsableChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const newResponsableId = event.target.value === "" ? null : Number(event.target.value);
        updateResponsable.mutate({ id: garde.id, responsableId: newResponsableId });
    };

    const handleRoleChange = (userId: number, newRole: string) => {
        updateRoleMutation.mutate({ userId, role: newRole });
        setOpenDropdownUserId(null);
    };

    const toggleDropdown = (userId: number) => {
        setOpenDropdownUserId(openDropdownUserId === userId ? null : userId);
    };

    // Fermer le dropdown quand on clique en dehors
    useEffect(() => {
        const handleClickOutside = () => {
            if (openDropdownUserId !== null) {
                setOpenDropdownUserId(null);
            }
        };

        if (openDropdownUserId !== null) {
            document.addEventListener('click', handleClickOutside);
        }

        return () => {
            document.removeEventListener('click', handleClickOutside);
        };
    }, [openDropdownUserId]);

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
                <div className="mt-2">
                    <label className="font-semibold block mb-1">Responsable :</label>
                    <select
                        value={responsable?.id || ""}
                        onChange={handleResponsableChange}
                        disabled={updateResponsable.isPending || filteredUsers.length === 0}
                        className="select select-bordered select-sm w-full max-w-xs"
                    >
                        <option value="">Aucun responsable</option>
                        {filteredUsers.map((user) => (
                            <option key={user.id} value={user.id}>
                                {user.firstname} {user.lastname}
                            </option>
                        ))}
                    </select>
                    {filteredUsers.length === 0 && (
                        <p className="text-xs text-warning mt-1 italic">
                            Ajoutez des membres pour assigner un responsable
                        </p>
                    )}
                </div>

                {/* Liste des membres */}
                <div className="mt-4">
                    <h3 className="font-semibold mb-2">
                        Membres ({filteredUsers.length}) :
                    </h3>
                    {filteredUsers.length > 0 ? (
                        <ul className="space-y-2">
                            {filteredUsers.map((user) => {
                                const isResponsable = responsable?.id === user.id;
                                const roleLabel = user.role === "superAdmin" ? "Super Admin" : 
                                                  user.role === "admin" ? "Admin" : "Utilisateur";
                                const roleBadgeColor = user.role === "superAdmin" ? "badge-error" : 
                                                       user.role === "admin" ? "badge-warning" : "badge-ghost";
                                const isDropdownOpen = openDropdownUserId === user.id;
                                
                                return (
                                    <li 
                                        key={user.id}
                                        className="flex items-center justify-between text-sm border border-base-content/10 rounded-lg p-2 hover:bg-base-200/50 transition-colors"
                                    >
                                        <div className="flex items-center gap-2">
                                            <span className="font-medium">
                                                {user.firstname} {user.lastname}
                                            </span>
                                            {isResponsable && (
                                                <span className="badge badge-primary badge-xs">
                                                    Responsable
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className={`dropdown dropdown-end ${isDropdownOpen ? 'dropdown-open' : ''}`}>
                                                <button
                                                    tabIndex={0}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        toggleDropdown(user.id);
                                                    }}
                                                    className={`badge badge-sm ${roleBadgeColor} whitespace-nowrap cursor-pointer hover:brightness-90 transition-all`}
                                                    title="Cliquez pour changer le rôle"
                                                >
                                                    {roleLabel}
                                                </button>
                                                <ul 
                                                    tabIndex={0} 
                                                    className="dropdown-content menu bg-base-100 rounded-box z-[1] w-48 p-2 shadow-lg border border-base-content/10 mt-1"
                                                >
                                                        <li>
                                                            <button
                                                                onClick={() => handleRoleChange(user.id, "user")}
                                                                className={user.role === "user" ? "active" : ""}
                                                                disabled={updateRoleMutation.isPending}
                                                            >
                                                                <span className="badge badge-sm badge-ghost">Utilisateur</span>
                                                            </button>
                                                        </li>
                                                        <li>
                                                            <button
                                                                onClick={() => handleRoleChange(user.id, "admin")}
                                                                className={user.role === "admin" ? "active" : ""}
                                                                disabled={updateRoleMutation.isPending}
                                                            >
                                                                <span className="badge badge-sm badge-warning">Admin</span>
                                                            </button>
                                                        </li>
                                                        {isSuperAdmin && (
                                                            <li>
                                                                <button
                                                                    onClick={() => handleRoleChange(user.id, "superAdmin")}
                                                                    className={user.role === "superAdmin" ? "active" : ""}
                                                                    disabled={updateRoleMutation.isPending}
                                                                >
                                                                    <span className="badge badge-sm badge-error">Super Admin</span>
                                                                </button>
                                                            </li>
                                                        )}
                                                    </ul>
                                            </div>
                                            <span className="text-xs text-base-content/60">
                                                {user.email}
                                            </span>
                                        </div>
                                    </li>
                                );
                            })}
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
