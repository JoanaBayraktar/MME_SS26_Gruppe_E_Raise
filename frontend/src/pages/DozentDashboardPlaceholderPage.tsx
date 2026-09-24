import { useNavigate } from "react-router-dom";
import { BackButton, Button, Card } from "../components/ui";
import { ROUTES } from "../routes";

// Das echte Veranstaltungs-Dashboard kommt erst mit #11. Bis dahin schon
// mal ein echter Einstieg für #13 (neue Session anlegen).
export default function DozentDashboardPlaceholderPage() {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen items-center justify-center bg-white px-6">
      <div className="w-full max-w-xs">
        <BackButton onClick={() => navigate(ROUTES.ONBOARDING)} className="mb-6" />

        <Card className="text-center">
          <p className="font-semibold text-gray-900">Dozenten-Dashboard</p>
          <p className="mt-2 text-sm text-gray-500">Wird in Issue #11 umgesetzt.</p>
        </Card>

        <Button className="mt-4" onClick={() => navigate(ROUTES.DOZENT_SESSION_NEW)}>
          + Neue Session
        </Button>
      </div>
    </div>
  );
}
