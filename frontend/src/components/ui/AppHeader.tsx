import { ReactNode } from "react";
import { Avatar } from "./Avatar";

interface AppHeaderProps {
  title: string;
  userName: string;
  action?: ReactNode;
}

// Obere Leiste für die Dashboard-Ansichten: Seitentitel, optionale primäre
// Aktion (z. B. "+ Veranstaltung anlegen") und Avatar der eingeloggten Person.
export function AppHeader({ title, userName, action }: AppHeaderProps) {
  return (
    <header className="flex items-center justify-between border-b border-gray-100 bg-white px-6 py-4">
      <h1 className="text-xl font-bold text-gray-900">{title}</h1>
      <div className="flex items-center gap-3">
        {action}
        <Avatar name={userName} variant="brand" />
      </div>
    </header>
  );
}
