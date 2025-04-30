import Tabs from "../../Components/Tabs/Tabs";
import { Vehicules } from "../Vehicules";
import { AdminTabs } from "./constants";
import { Users } from "./Users";

type AdminProps = {
    tabs: string[];
    activeTab: number;
    setActiveTab: React.Dispatch<React.SetStateAction<number>>;
    tabToDisplay: string;
};

function Admin({ tabs, activeTab, setActiveTab, tabToDisplay }: AdminProps) {
    return (
        <div className="flex flex-col items-center w-full">
            <h1 className="text-6xl m-10">Tableau de bord</h1>
            <Tabs tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab}/>
            <div id="tab-content" className="w-11/12">
                {tabToDisplay === AdminTabs.USERS && <Users />}
                {tabToDisplay === AdminTabs.VERIFEU && <Vehicules />}
            </div>
        </div>
    );
}

export default Admin;
