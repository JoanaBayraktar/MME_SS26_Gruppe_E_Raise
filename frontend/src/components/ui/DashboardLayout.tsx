import { ReactNode } from "react";
import { AppHeader } from "./AppHeader";
import { Sidebar, SidebarNavItem } from "./Sidebar";

interface DashboardLayoutProps {
  navItems: SidebarNavItem[];
  activeNavKey: string;
  title: string;
  userName: string;
  headerAction?: ReactNode;
  children: ReactNode;
}

// Gemeinsames Grundgerüst für alle Dozent:innen-Dashboard-Screens
// (Veranstaltungen, Sessions, Archiv, Account, ...), damit nicht jedes
// Feature seine eigene Sidebar/Header-Variante baut.
export function DashboardLayout({
  navItems,
  activeNavKey,
  title,
  userName,
  headerAction,
  children,
}: DashboardLayoutProps) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar items={navItems} activeKey={activeNavKey} />
      <div className="flex min-w-0 flex-1 flex-col">
        <AppHeader title={title} userName={userName} action={headerAction} />
        <main className="flex-1 px-6 py-6">{children}</main>
      </div>
    </div>
  );
}
