import React from "react";

type TabsProps = {
    tabs: string[];
    activeTab: number;
    setActiveTab: React.Dispatch<React.SetStateAction<number>>;
};

function Tabs({ tabs, activeTab, setActiveTab }: TabsProps) {
    return (
        <div className="w-11/12">
            <div role="tablist" className="tabs tabs-border tabs-xl flex justify-center w-full">
                {tabs.map((tab, index) => {
                    return (
                        <button key={index} type="button" role="tab" aria-selected={index === activeTab} className={`tab ${index === activeTab ? "tab-active" : ""}`} onClick={() => setActiveTab(index)}>
                            {tab}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}

export default Tabs;
