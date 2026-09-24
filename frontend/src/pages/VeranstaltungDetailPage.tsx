import { Layers } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Alert, BackButton, Badge, BadgeTone, Button, Card, EmptyState } from "../components/ui";
import { ApiError, getJson, isUnauthorized } from "../lib/api";
import { ROUTES } from "../routes";

interface VeranstaltungSessionDto {
  id: number;
  name: string;
  code: string;
  status: "GEPLANT" | "LAUFEND" | "BEENDET";
}

interface VeranstaltungDetailDto {
  id: number;
  name: string;
  kuerzel: string;
  sessions: VeranstaltungSessionDto[];
}

type LoadState = "loading" | "loaded" | "not-found" | "error";

const SESSION_STATUS_LABEL: Record<VeranstaltungSessionDto["status"], string> = {
  GEPLANT: "geplant",
  LAUFEND: "läuft",
  BEENDET: "beendet",
};

const SESSION_STATUS_TONE: Record<VeranstaltungSessionDto["status"], BadgeTone> = {
  GEPLANT: "neutral",
  LAUFEND: "brand",
  BEENDET: "muted",
};

// Vorläufiger Ersatz für die Veranstaltungsansicht aus #11 (Status-
// Übersicht etc. kommt dort). Zeigt schon die Sessions dieser konkreten
// Veranstaltung, damit "Neue Session" korrekt der richtigen Veranstaltung
// zugeordnet werden kann statt (wie vorher) automatisch der ersten.
export default function VeranstaltungDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [veranstaltung, setVeranstaltung] = useState<VeranstaltungDetailDto | null>(null);
  const [loadState, setLoadState] = useState<LoadState>("loading");

  useEffect(() => {
    getJson<VeranstaltungDetailDto>(`/api/veranstaltungen/${id}`)
      .then((data) => {
        setVeranstaltung(data);
        setLoadState("loaded");
      })
      .catch((err) => {
        if (isUnauthorized(err)) {
          navigate(ROUTES.LOGIN);
          return;
        }
        setLoadState(err instanceof ApiError && err.status === 404 ? "not-found" : "error");
      });
  }, [id, navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-white px-6 py-12">
      <div className="w-full max-w-xs">
        <BackButton onClick={() => navigate(ROUTES.DOZENT_DASHBOARD)} className="mb-6" />

        {loadState === "loading" && <p className="text-center text-sm text-gray-400">Wird geladen...</p>}

        {(loadState === "error" || loadState === "not-found") && (
          <Alert tone="error">
            {loadState === "not-found" ? "Diese Veranstaltung existiert nicht." : "Konnte Veranstaltung nicht laden."}
          </Alert>
        )}

        {loadState === "loaded" && veranstaltung && (
          <>
            <div className="text-center">
              <h1 className="text-2xl font-bold text-brand">{veranstaltung.name}</h1>
              <Badge tone="neutral" className="mt-2">
                {veranstaltung.kuerzel}
              </Badge>
            </div>

            <div className="mt-6 flex flex-col gap-3">
              {veranstaltung.sessions.length === 0 && (
                <Card>
                  <EmptyState
                    icon={Layers}
                    title="Noch keine Session"
                    description="Lege die erste Session für diese Veranstaltung an."
                  />
                </Card>
              )}

              {veranstaltung.sessions.map((session) => (
                <Card key={session.id}>
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-gray-900">{session.name}</p>
                    <Badge tone={SESSION_STATUS_TONE[session.status]}>{SESSION_STATUS_LABEL[session.status]}</Badge>
                  </div>
                  <p className="mt-1 text-xs text-gray-400">Code: {session.code}</p>
                </Card>
              ))}
            </div>

            <Button
              className="mt-6"
              onClick={() => navigate(ROUTES.DOZENT_SESSION_NEW, { state: { veranstaltungId: veranstaltung.id } })}
            >
              + Neue Session
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
