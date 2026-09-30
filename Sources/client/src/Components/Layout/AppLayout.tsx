import { NavLink, useNavigate } from "react-router";
import { useUser } from "../../App/Provider/UserProvider";
import { routePath } from "../../App/Routes/routeConstants";
import Button from "../Button/button";
import FeedbackModal from "../Modal/FeedbackModal";

type AppLayoutProps = {
    title: string;
    children: React.ReactNode;
};

function AppLayout({ title, children }: AppLayoutProps) {
    const { user, isAdmin, logout } = useUser();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate("/");
    };

    return (
        <div className="flex flex-col items-center w-full min-w-0">
            <header className="navbar w-full gap-2 border-b border-base-300 px-4">
                <span className="flex-1 truncate text-xl font-['Permanent_Marker']">Véri'Feu</span>
                {user && (
                    <span className="max-w-[40%] truncate text-sm opacity-70">
                        {user.firstname} {user.lastname}
                    </span>
                )}
                <FeedbackModal />
                <Button text="Déconnexion" onClick={handleLogout} className="btn-error" />
            </header>
            <nav className="flex gap-1 w-full justify-center border-b border-base-300 py-1" aria-label="Navigation principale">
                <NavLink to={routePath.vehicules} end className={({ isActive }) => `btn btn-ghost btn-sm ${isActive ? "btn-active" : ""}`}>
                    Véhicules
                </NavLink>
                <NavLink to={routePath.planning} className={({ isActive }) => `btn btn-ghost btn-sm ${isActive ? "btn-active" : ""}`}>
                    Planning
                </NavLink>
                {isAdmin && (
                    // Le tableau de bord admin n'est pas disponible sur mobile (cf. AdminRoutes)
                    <NavLink to={routePath.admin} className={({ isActive }) => `btn btn-ghost btn-sm hidden md:inline-flex ${isActive ? "btn-active" : ""}`}>
                        Admin
                    </NavLink>
                )}
            </nav>
            <h1 className="max-w-full px-4 my-6 md:my-10 text-center break-words text-3xl sm:text-4xl md:text-6xl">
                {title}
            </h1>
            {children}
        </div>
    );
}

export default AppLayout;
