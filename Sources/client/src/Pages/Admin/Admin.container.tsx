import Admin from "./Admin";
import { AdminTabs } from "./constants";
import { useAdmin } from "../../App/Provider/AdminProvider/AdminProvider";

function AdminContainer() {
    const { activeTab, setActiveTab } = useAdmin();

    const tabs: string[] = Object.values(AdminTabs)
    const tabToDisplay: string = tabs[activeTab];

    return <Admin tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab} tabToDisplay={tabToDisplay} />;
}

export default AdminContainer;