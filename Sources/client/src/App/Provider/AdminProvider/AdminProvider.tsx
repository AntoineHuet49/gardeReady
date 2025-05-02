import { createContext, useContext, useState } from "react";

type AdminContextType = {
    activeTab: number;
    setActiveTab: React.Dispatch<React.SetStateAction<number>>;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export const AdminProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [activeTab, setActiveTab] = useState<number>(0);

    return (
        <AdminContext.Provider value={{activeTab, setActiveTab}}>
            {children}
        </AdminContext.Provider>
    );
};

export const useAdmin = (): AdminContextType => {
    const context = useContext(AdminContext);
    if (context === undefined) {
        throw new Error("useAdmin must be used within an AdminProvider");
    }
    return context;
};

