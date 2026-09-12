import { createContext, useContext, useState } from 'react';

const SidebarContext = createContext(null);

export function SidebarProvider({ children }) {
  const [isOpen, setIsOpen] = useState(false);

  const value = {
    isOpen,
    openSidebar: () => setIsOpen(true),
    closeSidebar: () => setIsOpen(false),
    toggleSidebar: () => setIsOpen((current) => !current),
  };

  return (
    <SidebarContext.Provider value={value}>
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  const context = useContext(SidebarContext);

  if (!context) {
    throw new Error('useSidebar must be used within a SidebarProvider');
  }

  return context;
}