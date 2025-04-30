import { useState } from "react";
import Admin from "./Admin";
import { AdminTabs } from "./constants";

function AdminContainer() {
    const tabs: string[] = Object.values(AdminTabs)
    const [activeTab, setActiveTab] = useState<number>(0);
    const tabToDisplay: string = tabs[activeTab];

    return <Admin tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab} tabToDisplay={tabToDisplay} />;
}

export default AdminContainer;