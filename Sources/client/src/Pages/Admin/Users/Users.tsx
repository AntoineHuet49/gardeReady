import Loader from "../../../Components/Loader/Loader";
import { User } from "../../../Types/User";
import AddUserModal from "./AddUserModal/AddUserModal";
import { useUser } from "../../../App/Provider/UserProvider";

type UsersProps = {
    users?: User[];
    isLoading: boolean;
    error: Error | null;
};

function Users({ users, isLoading }: UsersProps) {
    const { isSuperAdmin } = useUser();

    // Filtrer les utilisateurs : les admins normaux ne voient pas les superAdmin
    const filteredUsers = users?.filter(user => {
        if (isSuperAdmin) {
            // Les superAdmin voient tous les comptes
            return true;
        } else {
            // Les admins normaux ne voient pas les superAdmin
            return user.role !== "superAdmin";
        }
    });

    return (
        <>
            {isLoading && <Loader />}
            {filteredUsers && filteredUsers.length > 0 && (
                <div className="overflow-x-auto rounded-box border border-base-content/5 bg-base-100 my-3.5">
                    <table className="table">
                        {/* head */}
                        <thead>
                            <tr>
                                <th><AddUserModal buttonText="+" /></th>
                                <th>Prénom</th>
                                <th>Nom</th>
                                <th>Email</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredUsers.map((user) => (
                                <tr className="hover:bg-base-300" key={user.id}>
                                    <th></th>
                                    <td>{user.firstname}</td>
                                    <td>{user.lastname}</td>
                                    <td>{user.email}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </>
    );
}

export default Users;
