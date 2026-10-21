import { Navigate } from "react-router";
import { useUser } from "../Provider/UserProvider";

type PrivateRouteProps = {
    children: React.ReactNode;
};

const PrivateRoute = ({ children }: PrivateRouteProps) => {
    const { isAuthenticated } = useUser();
    return isAuthenticated ? (<>{children}</>) : <Navigate to="/" />;
};
export default PrivateRoute;
