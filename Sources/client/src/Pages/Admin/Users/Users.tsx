import Loader from "../../../Components/Loader/Loader";
import { User } from "../../../Types/User";
import AddUserModal from "./AddUserModal/AddUserModal";

type UsersProps = {
    users?: User[];
    isLoading: boolean;
    error: Error | null;
};

function Users({ users, isLoading }: UsersProps) {
    return (
        <>
            {isLoading && <Loader />}
            {users && users.length > 0 && (
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
                            {users.map((user) => (
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
