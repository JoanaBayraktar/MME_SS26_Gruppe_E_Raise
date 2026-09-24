import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Alert, BackButton, Badge, Button, Card, EmptyState } from "../components/ui";
import { getJson, VeranstaltungDto } from "../lib/api";
import { ROUTES } from "../routes";
import { Layers } from "lucide-react";

type LoadState = "loading" | "loaded" | "error";

// Das echte Veranstaltungs-Dashboard (Status-Übersicht, Bearbeiten, ...)
// kommt erst mit #11. Bis dahin: echte Liste der eigenen Veranstaltungen
// plus Einstiegspunkte für #10 (Veranstaltung) und #13 (Session).
export default function DozentDashboardPlaceholderPage() {
  const navigate = useNavigate();
  const [veranstaltungen, setVeranstaltungen] = useState<VeranstaltungDto[]>([]);
  const [loadState, setLoadState] = useState<LoadState>("loading");

  useEffect(() => {
    getJson<VeranstaltungDto[]>("/api/veranstaltungen")
      .then((data) => {
        setVeranstaltungen(data);
        setLoadState("loaded");
      })
      .catch(() => setLoadState("error"));
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center bg-white px-6 py-12">
      <div className="w-full max-w-xs">
        <BackButton onClick={() => navigate(ROUTES.ONBOARDING)} className="mb-6" />

        <div className="text-center">
          <h1 className="text-2xl font-bold text-brand">Deine Veranstaltungen</h1>
        </div>

        <div className="mt-6 flex flex-col gap-3">
          {loadState === "error" && <Alert tone="error">Konnte Veranstaltungen nicht laden.</Alert>}

          {loadState === "loaded" && veranstaltungen.length === 0 && (
            <Card>
              <EmptyState
                icon={Layers}
                title="Noch keine Veranstaltung"
                description="Lege deine erste Veranstaltung an, um Sessions zu erstellen."
              />
            </Card>
          )}

          {veranstaltungen.map((veranstaltung) => (
            <Card key={veranstaltung.id}>
              <p className="font-semibold text-gray-900">{veranstaltung.name}</p>
              <Badge tone="neutral" className="mt-2">
                {veranstaltung.kuerzel}
              </Badge>
            </Card>
          ))}
        </div>

        <div className="mt-6 flex flex-col gap-3">
          <Button variant="outline" onClick={() => navigate(ROUTES.DOZENT_SESSION_NEW)}>
            + Neue Session
          </Button>
          <Button onClick={() => navigate(ROUTES.DOZENT_VERANSTALTUNG_NEW)}>+ Neue Veranstaltung</Button>
        </div>
      </div>
    </div>
  );
}
