import { Navigate } from "react-router";
import { useUser } from "../Provider/UserProvider";
import { routePath } from "./routeConstants";

type AdminRoutesProps = {
    children: React.ReactNode;
};

const AdminRoutes = ({ children }: AdminRoutesProps) => {
    const { isAdmin } = useUser();

    return isAdmin ? <>{children}</> : <Navigate to={routePath.vehicules} />;
};
export default AdminRoutes;
