import {
  LayoutDashboard,
  Wallet,
  TrendingUp,
  FileText,
  Users,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  LogOut
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useSidebar } from "./SidebarContext";

interface NavItem {
  icon: React.ReactNode;
  label: string;
  href: string;
  badge?: number;
}

export function Sidebar() {
  const { t } = useTranslation();
  const { collapsed, toggle } = useSidebar();
  const location = useLocation();

  const mainNavItems: NavItem[] = [
    { icon: <LayoutDashboard className="w-5 h-5" />, label: t('sidebar.dashboard'), href: "/" },
    { icon: <TrendingUp className="w-5 h-5" />, label: t('sidebar.deals'), href: "/deals" },
    { icon: <Wallet className="w-5 h-5" />, label: t('sidebar.expenses'), href: "/expenses" },
  ];



  return (
    <aside
      className={`fixed left-0 top-0 h-screen bg-[#0a2540] border-r border-white/10 flex flex-col transition-all duration-300 z-50 ${collapsed ? "w-20" : "w-64"
        }`}
    >
      {/* Logo */}
      <div className="p-6 border-b border-white/10 ">
        <div className="flex items-center gap-3">
          <div className={`flex items-center justify-center transition-all duration-300 ${collapsed ? "w-10 h-10" : "w-12 h-12"} rounded-lg bg-[#0a2540] p-1 shadow-sm`}>
            <img 
              src="/logo-expatur.png" 
              alt="Expatur Logo" 
              className="w-full h-full object-contain"
            />
          </div>
          {!collapsed && (
            <div className="animate-fade-in text-nowrap">
              <h1 className="text-lg font-bold font-display text-white leading-tight tracking-tight">Expatur</h1>
              <p className="text-[10px] uppercase tracking-widest text-white/60 font-semibold">Metrics</p>
            </div>
          )}
        </div>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {mainNavItems.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <Link
              key={item.label}
              to={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                isActive 
                  ? "bg-white/10 text-white" 
                  : "text-white/60 hover:bg-white/5 hover:text-white"
              }`}
            >
              <span className="text-inherit">{item.icon}</span>
              {!collapsed && (
                <span className="flex-1 text-left text-sm font-medium">{item.label}</span>
              )}
              {!collapsed && item.badge && (
                <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-primary text-primary-foreground">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom Navigation */}
      <div className="p-4 border-t border-white/10 space-y-1">

        
        <button
          onClick={async () => {
            await supabase.auth.signOut();
            toast.success("Sessão encerrada");
          }}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 text-white/60 hover:bg-red-500/10 hover:text-red-400 group"
        >
          <LogOut className="w-5 h-5 group-hover:rotate-12 transition-transform" />
          {!collapsed && (
            <span className="flex-1 text-left text-sm font-medium">Sair</span>
          )}
        </button>
      </div>

      {/* Collapse Button */}
      <button
        onClick={toggle}
        className="absolute -right-3 top-20 w-6 h-6 rounded-full bg-[#0a2540] border border-white/20 flex items-center justify-center text-white/60 hover:text-white transition-colors"
      >
        {collapsed ? (
          <ChevronRight className="w-4 h-4" />
        ) : (
          <ChevronLeft className="w-4 h-4" />
        )}
      </button>
    </aside>
  );
}
