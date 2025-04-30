import React from "react";

type TabsProps = {
    tabs: string[];
    activeTab: number;
    setActiveTab: React.Dispatch<React.SetStateAction<number>>;
};

function Tabs({ tabs, activeTab, setActiveTab }: TabsProps) {
    const handleTabClick = (e: React.MouseEvent<HTMLAnchorElement>): void => {
        const tabIndex: number = tabs.indexOf(e.currentTarget.innerText);
        setActiveTab(tabIndex);
    };

    return (
        <div className="w-11/12">
            <div role="tablist" className="tabs tabs-border tabs-xl flex justify-center w-full">
                {tabs.map((tab, index) => {
                    return (
                        <a key={index} role="tab" className={`tab ${index === activeTab ? "tab-active" : ""}`} onClick={(e) => handleTabClick(e)}>
                            {tab}
                        </a>
                    );
                })}
            </div>
        </div>
    );
}

export default Tabs;
