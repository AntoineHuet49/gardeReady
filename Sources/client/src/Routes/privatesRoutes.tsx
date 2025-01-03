import { Navigate } from "react-router";

type PrivateRouteProps = {
    Component: React.ComponentType;
};

const PrivateRoute = ({ Component }: PrivateRouteProps) => {
    let isAuthenticated = false;

    document.cookie.split(";").forEach((cookie) => {
        const [name] = cookie.trim().split("=");
        if (name === "token") {
            isAuthenticated = true;
        }
    });

    return isAuthenticated ? <Component /> : <Navigate to="/" />;
};
export default PrivateRoute;
