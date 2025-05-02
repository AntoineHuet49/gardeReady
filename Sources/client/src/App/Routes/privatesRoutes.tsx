import { Navigate } from "react-router";

type PrivateRouteProps = {
    children: React.ReactNode;
};

const PrivateRoute = ({ children }: PrivateRouteProps) => {
    let isAuthenticated = false;

    document.cookie.split(";").forEach((cookie) => {
        const [name] = cookie.trim().split("=");
        if (name === "token") {
            isAuthenticated = true;
        }
    });

    return isAuthenticated ? (<>{children}</>) : <Navigate to="/" />;
};
export default PrivateRoute;
