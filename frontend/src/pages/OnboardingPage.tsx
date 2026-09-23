import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button, SegmentedControl } from "../components/ui";
import { ROLE, Role } from "../lib/role";
import { getStoredSession } from "../lib/session";
import { ROUTES } from "../routes";

const ROLE_OPTIONS: { value: Role; label: string }[] = [
  { value: ROLE.STUDENT, label: "Studi" },
  { value: ROLE.DOZENT, label: "Dozi" },
];

const ROLE_HINT: Record<Role, string> = {
  [ROLE.STUDENT]: "Als Studi brauchst du keinen Account — nur den Code der Session.",
  [ROLE.DOZENT]: "Als Dozent meldest du dich mit deinem Account an.",
};

// Ziel-Route pro Rolle, je nachdem ob neu gestartet oder eine Session fortgesetzt wird
const ROLE_TARGET: Record<Role, string> = {
  [ROLE.STUDENT]: ROUTES.JOIN,
  [ROLE.DOZENT]: ROUTES.LOGIN,
};

const RESUME_TARGET: Record<Role, string> = {
  [ROLE.STUDENT]: ROUTES.JOIN,
  [ROLE.DOZENT]: ROUTES.DOZENT_DASHBOARD,
};

export default function OnboardingPage() {
  const [role, setRole] = useState<Role>(ROLE.STUDENT);
  const navigate = useNavigate();
  const storedSession = getStoredSession();

  const handleWeiter = () => {
    if (storedSession) {
      navigate(RESUME_TARGET[storedSession.role]);
      return;
    }
    navigate(ROLE_TARGET[role]);
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 bg-white px-6 text-center">
      <div>
        <h1 className="text-4xl font-bold text-brand">Raise</h1>
        <p className="mt-2 text-gray-600">Live-Fragen &amp; Umfragen zur Vorlesung</p>
      </div>

      <div className="w-full max-w-xs">
        <SegmentedControl aria-label="Rolle wählen" value={role} onChange={setRole} options={ROLE_OPTIONS} />

        <Button className="mt-4" onClick={handleWeiter}>
          Weiter
        </Button>

        <p
          key={role}
          className="mt-4 flex min-h-[2.5rem] animate-fade-in items-center justify-center text-xs text-gray-400"
        >
          {ROLE_HINT[role]}
        </p>
      </div>
    </div>
  );
}
