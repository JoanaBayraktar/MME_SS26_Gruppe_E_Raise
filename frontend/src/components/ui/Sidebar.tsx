import { LucideIcon } from "lucide-react";
import { Link } from "react-router-dom";

export interface SidebarNavItem {
  key: string;
  label: string;
  icon: LucideIcon;
  href: string;
}

interface SidebarProps {
  items: SidebarNavItem[];
  activeKey: string;
}

// Desktop-Navigation für die Dozent:innen-Ansichten (Veranstaltungen,
// Sessions, Archiv, Account, ...). Auf schmalen Screens ausgeblendet, siehe
// DashboardLayout für den Umgang damit.
export function Sidebar({ items, activeKey }: SidebarProps) {
  return (
    <aside className="hidden w-56 shrink-0 flex-col border-r border-gray-100 bg-white px-4 py-6 md:flex">
      <span className="mb-8 px-2 text-xl font-bold text-brand">Raise</span>
      <nav className="flex flex-col gap-1">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = item.key === activeKey;
          return (
            <Link
              key={item.key}
              to={item.href}
              className={`flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition ${
                isActive ? "bg-brand-light text-brand" : "text-gray-500 hover:bg-gray-50"
              }`}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
