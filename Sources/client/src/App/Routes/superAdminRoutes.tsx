import { Navigate } from "react-router";
import { useUser } from "../Provider/UserProvider";
import { routePath } from "./routeConstants";

type SuperAdminRoutesProps = {
    children: React.ReactNode;
};

const SuperAdminRoutes = ({ children }: SuperAdminRoutesProps) => {
    const { isSuperAdmin } = useUser();

    return isSuperAdmin ? <>{children}</> : <Navigate to={routePath.vehicules} />;
};

export default SuperAdminRoutes;
