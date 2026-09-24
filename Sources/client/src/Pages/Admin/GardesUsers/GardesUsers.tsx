import { useState } from "react";
import ConfirmModal, { PendingConfirm } from "../../../Components/Modal/ConfirmModal";
import Loader from "../../../Components/Loader/Loader";
import { Garde } from "../../../Types/Garde";
import { User } from "../../../Types/User";
import GardeCard from "./GardeCard";
import AddUserModal from "./AddUserModal/AddUserModal";
import AddGardeModal from "./AddGardeModal/AddGardeModal";
import EditUserModal from "./EditUserModal/EditUserModal";
import Button from "../../../Components/Button/button";
import { useUser } from "../../../App/Provider/UserProvider";
import { useAuthMutations } from "../../../hooks/useAuthMutations";

type GardesUsersProps = {
    gardes?: Garde[];
    usersByGarde: Record<number, User[]>;
    allUsers: User[];
    isLoading: boolean;
    error: Error | null;
};

function GardesUsers({ gardes, usersByGarde, allUsers, isLoading }: GardesUsersProps) {
    const { user: currentUser } = useUser();
    const { deleteUserMutation, updateGardeMutation } = useAuthMutations();
    const [pendingConfirm, setPendingConfirm] = useState<PendingConfirm>(null);
    const [isDragOver, setIsDragOver] = useState(false);

    // Récupérer les utilisateurs non assignés à une garde
    const unassignedUsers = allUsers.filter(user => !user.garde_id);

    const handleDeleteUser = (user: User) => {
        setPendingConfirm({
            message: `Êtes-vous sûr de vouloir supprimer ${user.firstname} ${user.lastname} ? Cette action est irréversible.`,
            onConfirm: () => deleteUserMutation.mutate(user.id),
        });
    };

    const handleDragOver = (event: React.DragEvent) => {
        event.preventDefault();
        setIsDragOver(true);
    };

    const handleDragLeave = () => setIsDragOver(false);

    const handleDrop = (event: React.DragEvent) => {
        event.preventDefault();
        setIsDragOver(false);
        const userId = Number(event.dataTransfer.getData("text/plain"));
        if (!userId) return;
        updateGardeMutation.mutate({ userId, gardeId: null });
    };

    return (
        <div className="container mx-auto p-6">
            {isLoading && <Loader />}
            <ConfirmModal pending={pendingConfirm} onClose={() => setPendingConfirm(null)} />
            
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

            {!isLoading && gardes?.length === 0 && (
                <p className="text-center text-base-content/70 py-8">
                    Aucune garde n'a été créée pour le moment.
                </p>
            )}

            {/* Card pour les utilisateurs non assignés (glisser un membre ici pour le désassigner) */}
            {!isLoading && (
                <div className="mt-4">
                    <div
                        className={`card bg-base-100 border shadow-sm transition-colors ${isDragOver ? 'border-primary border-2' : 'border-base-content/10'}`}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                    >
                        <div className="card-body">
                            <h3 className="card-title text-warning">
                                ⚠️ Utilisateurs non assignés à une garde
                            </h3>
                            {unassignedUsers.length > 0 ? (
                                <ul className="space-y-2 mt-2">
                                    {unassignedUsers.map((user) => (
                                        <li
                                            key={user.id}
                                            draggable
                                            onDragStart={(e) => e.dataTransfer.setData("text/plain", String(user.id))}
                                            className="text-sm flex items-center justify-between gap-2 cursor-grab active:cursor-grabbing"
                                        >
                                            <span>• {user.firstname} {user.lastname}</span>
                                            <div className="flex items-center gap-2">
                                                <EditUserModal user={user} />
                                                {currentUser?.id !== user.id && (
                                                    <Button
                                                        text={deleteUserMutation.isPending ? "..." : "✕"}
                                                        onClick={() => handleDeleteUser(user)}
                                                        className="btn-xs bg-red-100 text-red-700 border-red-200 hover:bg-red-200"
                                                        title="Supprimer cet utilisateur"
                                                        disabled={deleteUserMutation.isPending}
                                                    />
                                                )}
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-sm text-base-content/60 italic mt-2">
                                    Aucun utilisateur non assigné — glissez un membre ici pour le retirer de sa garde.
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default GardesUsers;
