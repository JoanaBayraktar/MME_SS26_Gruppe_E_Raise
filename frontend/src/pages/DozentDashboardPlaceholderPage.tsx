import { Layers } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Alert, BackButton, Badge, Button, Card, EmptyState } from "../components/ui";
import { getJson, isUnauthorized, VeranstaltungDto } from "../lib/api";
import { buildVeranstaltungDetailPath, ROUTES } from "../routes";

type LoadState = "loading" | "loaded" | "error";

// Das echte Veranstaltungs-Dashboard (Status-Übersicht, Bearbeiten, ...)
// kommt erst mit #11. Bis dahin: echte Liste der eigenen Veranstaltungen
// plus Einstieg für #10 (Veranstaltung). Sessions werden bewusst nicht
// mehr von hier aus angelegt, sondern erst nach Auswahl einer konkreten
// Veranstaltung (siehe VeranstaltungDetailPage) – #13 hängt sonst an
// keiner eindeutigen Veranstaltung.
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
      .catch((err) => {
        if (isUnauthorized(err)) {
          navigate(ROUTES.LOGIN);
          return;
        }
        setLoadState("error");
      });
  }, [navigate]);

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
            <button
              key={veranstaltung.id}
              type="button"
              onClick={() => navigate(buildVeranstaltungDetailPath(veranstaltung.id))}
              className="text-left"
            >
              <Card className="transition hover:border-brand">
                <p className="font-semibold text-gray-900">{veranstaltung.name}</p>
                <Badge tone="neutral" className="mt-2">
                  {veranstaltung.kuerzel}
                </Badge>
              </Card>
            </button>
          ))}
        </div>

        <Button className="mt-6" onClick={() => navigate(ROUTES.DOZENT_VERANSTALTUNG_NEW)}>
          + Neue Veranstaltung
        </Button>
      </div>
    </div>
  );
}
