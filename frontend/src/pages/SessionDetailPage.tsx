import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Alert, Badge, Button, Modal } from "../components/ui";
import { ApiError, getJson, isUnauthorized, patchJson, SessionDetailDto } from "../lib/api";
import { formatDatum, formatUhrzeit } from "../lib/formatDate";
import { SESSION_STATUS_LABEL, SESSION_STATUS_TONE } from "../lib/sessionStatus";
import { ROUTES } from "../routes";

type LoadState = "loading" | "loaded" | "not-found" | "error";

export default function SessionDetailPage() {
  const navigate = useNavigate();
  const { sessionId } = useParams<{ sessionId: string }>();
  const [session, setSession] = useState<SessionDetailDto | null>(null);
  const [loadState, setLoadState] = useState<LoadState>("loading");
  const [statusError, setStatusError] = useState<string | null>(null);
  const [isChangingStatus, setIsChangingStatus] = useState(false);

  useEffect(() => {
    getJson<SessionDetailDto>(`/api/sessions/${sessionId}`)
      .then((sessionData) => {
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

  const changeStatus = async (status: "LAUFEND" | "BEENDET") => {
    if (!session) return;
    setStatusError(null);
    setIsChangingStatus(true);
    try {
      const updated = await patchJson<{ id: number; status: "GEPLANT" | "LAUFEND" | "BEENDET" }>(
        `/api/sessions/${session.id}/status`,
        { status }
      );
      setSession({ ...session, status: updated.status });
    } catch (err) {
      setStatusError(err instanceof ApiError ? err.message : "Status konnte nicht geändert werden.");
    } finally {
      setIsChangingStatus(false);
    }
  };

  return (
    <Modal className="max-w-lg p-8" onClose={() => navigate(ROUTES.DOZENT_SESSIONS)}>
      {() => (
        <>
          {loadState === "error" && <Alert tone="error">Konnte Session nicht laden.</Alert>}
          {loadState === "not-found" && <Alert tone="error">Diese Session existiert nicht.</Alert>}
          {loadState === "loading" && <p className="text-sm text-gray-500">Lädt...</p>}

          {loadState === "loaded" && session && (
            <div className="flex flex-col gap-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h1 className="text-lg font-bold text-gray-900">{session.name}</h1>
                  <p className="mt-1 text-sm text-gray-500">{session.veranstaltungName}</p>
                </div>
                <Badge tone={SESSION_STATUS_TONE[session.status]}>{SESSION_STATUS_LABEL[session.status]}</Badge>
              </div>

              <dl className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-3">
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

              <div className="rounded-xl bg-gray-50 px-4 py-3">
                <p className="text-xs font-medium uppercase tracking-wide text-gray-400">Beitritts-Code</p>
                <p className="mt-1 text-2xl font-bold tracking-widest text-brand">{session.code}</p>
              </div>

              {statusError && <Alert tone="error">{statusError}</Alert>}

              {!session.autoStart && session.status === "GEPLANT" && (
                <Button className="w-auto px-4" disabled={isChangingStatus} onClick={() => changeStatus("LAUFEND")}>
                  {isChangingStatus ? "Wird gestartet..." : "Jetzt starten"}
                </Button>
              )}

              {!session.autoStart && session.status === "LAUFEND" && (
                <Button
                  variant="outline"
                  className="w-auto px-4"
                  disabled={isChangingStatus}
                  onClick={() => changeStatus("BEENDET")}
                >
                  {isChangingStatus ? "Wird beendet..." : "Beenden"}
                </Button>
              )}

              <p className="text-sm text-gray-500">Live-Ansicht mit Fragen &amp; Umfragen folgt in Issue #16.</p>
            </div>
          )}
        </>
      )}
    </Modal>
  );
}
