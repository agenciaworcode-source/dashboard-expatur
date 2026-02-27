import React from "react";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { SidebarProvider, useSidebar } from "./SidebarContext";

const LayoutContent: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { collapsed } = useSidebar();

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <div 
        className={`transition-all duration-300 ${collapsed ? "pl-20" : "pl-64"}`}
      >
        <Header />
        <main className="p-6 space-y-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <SidebarProvider>
      <LayoutContent>{children}</LayoutContent>
    </SidebarProvider>
  );
};
