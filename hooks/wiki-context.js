import React, { createContext, useState, useEffect } from "react";

export const WikiContext = createContext({
  isReportModalOpen: false,
  toggleReportModal: ()=>{},
  isDICPunchModalOpen: false,
  toggleDICPunchModal: ()=>{},
  detail: null,
  setDetail: ()=>{},
});

export const WikiProvider = ({children}) => {
  const [detail, setDetail] = useState(null);
  const [isReportModalOpen, setReportModalOpen] = useState(false);
  const [isDICPunchModalOpen, setDICPunchModalOpen] = useState(false);

  const toggleReportModal = () => {
    setReportModalOpen(!isReportModalOpen);
  }
  const toggleDICPunchModal =() => {
    setDICPunchModalOpen(!isDICPunchModalOpen);
  }

  return (
    <WikiContext.Provider
      value={{
        isReportModalOpen,
        toggleReportModal,
        isDICPunchModalOpen,
        toggleDICPunchModal,
        detail,
        setDetail,                
      }}>
    {children}
    </WikiContext.Provider>
  );
}