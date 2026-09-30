import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Alert, Badge, Card, DashboardLayout } from "../components/ui";
import { ApiError, DozentDto, getJson, isUnauthorized, SessionDetailDto } from "../lib/api";
import { DOZENT_NAV_ITEMS } from "../lib/dozentNav";
import { formatDatum, formatUhrzeit } from "../lib/formatDate";
import { SESSION_STATUS_LABEL, SESSION_STATUS_TONE } from "../lib/sessionStatus";
import { ROUTES } from "../routes";

type LoadState = "loading" | "loaded" | "not-found" | "error";

export default function SessionDetailPage() {
  const navigate = useNavigate();
  const { sessionId } = useParams<{ sessionId: string }>();
  const [dozent, setDozent] = useState<DozentDto | null>(null);
  const [session, setSession] = useState<SessionDetailDto | null>(null);
  const [loadState, setLoadState] = useState<LoadState>("loading");

  useEffect(() => {
    Promise.all([getJson<DozentDto>("/api/auth/me"), getJson<SessionDetailDto>(`/api/sessions/${sessionId}`)])
      .then(([dozentData, sessionData]) => {
        setDozent(dozentData);
        setSession(sessionData);
        setLoadState("loaded");
      })
      .catch((err) => {
        if (isUnauthorized(err)) {
          navigate(ROUTES.LOGIN);
          return;
        }
        setLoadState(err instanceof ApiError && err.status === 404 ? "not-found" : "error");
      });
  }, [navigate, sessionId]);

  return (
    <DashboardLayout
      navItems={DOZENT_NAV_ITEMS}
      activeNavKey="sessions"
      title="Session"
      userName={dozent ? `${dozent.vorname} ${dozent.nachname}` : ""}
    >
      {loadState === "error" && <Alert tone="error">Konnte Session nicht laden.</Alert>}
      {loadState === "not-found" && <Alert tone="error">Diese Session existiert nicht.</Alert>}

      {loadState === "loaded" && session && (
        <div className="flex flex-col gap-4">
          <Card>
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="text-lg font-bold text-gray-900">{session.name}</h1>
                <p className="mt-1 text-sm text-gray-500">{session.veranstaltungName}</p>
              </div>
              <Badge tone={SESSION_STATUS_TONE[session.status]}>{SESSION_STATUS_LABEL[session.status]}</Badge>
            </div>

            <dl className="mt-6 grid grid-cols-2 gap-4 text-sm sm:grid-cols-3">
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-gray-400">Datum</dt>
                <dd className="mt-1 text-gray-900">{formatDatum(session.datum)}</dd>
              </div>
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-gray-400">Von</dt>
                <dd className="mt-1 text-gray-900">{formatUhrzeit(session.startZeit)}</dd>
              </div>
              {session.endZeit && (
                <div>
                  <dt className="text-xs font-medium uppercase tracking-wide text-gray-400">Bis</dt>
                  <dd className="mt-1 text-gray-900">{formatUhrzeit(session.endZeit)}</dd>
                </div>
              )}
            </dl>

            <div className="mt-6 rounded-xl bg-gray-50 px-4 py-3">
              <p className="text-xs font-medium uppercase tracking-wide text-gray-400">Beitritts-Code</p>
              <p className="mt-1 text-2xl font-bold tracking-widest text-brand">{session.code}</p>
            </div>
          </Card>

          <Card className="text-sm text-gray-500">Live-Ansicht mit Fragen &amp; Umfragen folgt in Issue #16.</Card>
        </div>
      )}
    </DashboardLayout>
  );
}
