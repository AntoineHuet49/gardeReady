import Tabs from "../../Components/Tabs/Tabs";
import { Vehicules } from "../Vehicules";
import { AdminVehicule } from "./AdminVehicules";
import { AdminTabs } from "./constants";
import { GardesUsers } from "./GardesUsers";
import Button from "../../Components/Button/button";
import { useUser } from "../../App/Provider/UserProvider/UserContext";
import { useNavigate } from "react-router";

type AdminProps = {
    tabs: string[];
    activeTab: number;
    setActiveTab: React.Dispatch<React.SetStateAction<number>>;
    tabToDisplay: string;
};

function Admin({ tabs, activeTab, setActiveTab, tabToDisplay }: AdminProps) {
    const { logout } = useUser();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate("/");
    };

    return (
        <div className="flex flex-col items-center w-full">
            <div className="w-full relative flex justify-center mt-10 mb-10">
                <h1 className="text-6xl">Tableau de bord</h1>
                <Button 
                    text="Déconnexion" 
                    onClick={handleLogout}
                    className="btn-error absolute right-10"
                />
            </div>
            <Tabs tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab}/>
            <div id="tab-content" className="w-11/12">
                {tabToDisplay === AdminTabs.GARDES && <GardesUsers />}
                {tabToDisplay === AdminTabs.VEHICULES && <AdminVehicule />}
                {tabToDisplay === AdminTabs.VERIFEU && <Vehicules />}
            </div>
        </div>
    );
}

export default Admin;
