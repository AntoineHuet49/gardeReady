import { useNavigate } from "react-router";
import { useUser } from "../../App/Provider/UserProvider";
import Button from "../Button/button";

type AppLayoutProps = {
    title: string;
    children: React.ReactNode;
};

function AppLayout({ title, children }: AppLayoutProps) {
    const { logout } = useUser();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate("/");
    };

    return (
        <div className="flex flex-col items-center w-full min-w-0">
            <header className="navbar w-full gap-2 border-b border-base-300 px-4">
                <span className="flex-1 truncate text-xl font-['Permanent_Marker']">Véri'Feu</span>
                <Button text="Déconnexion" onClick={handleLogout} className="btn-error" />
            </header>
            <h1 className="max-w-full px-4 my-6 md:my-10 text-center break-words text-3xl sm:text-4xl md:text-6xl">
                {title}
            </h1>
            {children}
        </div>
    );
}

export default AppLayout;
