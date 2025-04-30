import { Navigate } from "react-router";
import { useUser } from "../App/UserProvider";

type AdminRoutesProps = {
    Component: React.ComponentType;
};

const AdminRoutes = ({ Component }: AdminRoutesProps) => {
    let isAdmin = false;
    const { user, isAuthenticated } = useUser();

    if (user && user.role === "admin") {
        isAdmin = true;
    }

    return isAdmin && isAuthenticated ? <Component /> : <Navigate to="/" />;
};
export default AdminRoutes;
