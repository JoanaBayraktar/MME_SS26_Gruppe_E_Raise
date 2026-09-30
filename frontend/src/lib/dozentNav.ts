import { Archive, Calendar, Folder, User } from "lucide-react";
import { SidebarNavItem } from "../components/ui";
import { ROUTES } from "../routes";

// Gemeinsame Sidebar-Navigation für alle Dozent:innen-Dashboard-Screens.
export const DOZENT_NAV_ITEMS: SidebarNavItem[] = [
  { key: "veranstaltungen", label: "Veranstaltungen", icon: Folder, href: ROUTES.DOZENT_DASHBOARD },
  { key: "sessions", label: "Sessions", icon: Calendar, href: ROUTES.DOZENT_SESSIONS },
  { key: "archiv", label: "Archiv", icon: Archive, href: ROUTES.DOZENT_ARCHIV },
  { key: "account", label: "Account", icon: User, href: ROUTES.DOZENT_ACCOUNT },
];
