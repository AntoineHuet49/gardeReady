import { useEffect, useState } from "react";
import { Navigate } from "react-router";
import { useUser } from "../Provider/UserProvider";
import { routePath } from "./routeConstants";

type AdminRoutesProps = {
    children: React.ReactNode;
};

// Le tableau de bord admin n'est pas conçu pour mobile : même seuil que la redirection au login
const mobileQuery = window.matchMedia("(max-width: 768px)");

const AdminRoutes = ({ children }: AdminRoutesProps) => {
    const { isAdmin } = useUser();
    const [isMobile, setIsMobile] = useState(mobileQuery.matches);

    useEffect(() => {
        const onChange = (e: MediaQueryListEvent) => setIsMobile(e.matches);
        mobileQuery.addEventListener("change", onChange);
        return () => mobileQuery.removeEventListener("change", onChange);
    }, []);

    return isAdmin && !isMobile ? <>{children}</> : <Navigate to={routePath.vehicules} />;
};
export default AdminRoutes;
