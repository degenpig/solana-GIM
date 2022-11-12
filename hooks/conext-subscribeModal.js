import React, { createContext, useState, useEffect } from "react";

export const SubModalContext = createContext({
    isSubModalOpen: false,
    setIsSubModalOpen: null,
});

export const SubModalProvider = ({children}) => {
    const [isSubModalOpen, setIsSubModalOpen] = useState(false);

    return (
        <SubModalContext.Provider
            value={{
                isSubModalOpen,
                setIsSubModalOpen,                
            }}>
        {children}
        </SubModalContext.Provider>
    );
}