import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Alert, Badge, Modal } from "../components/ui";
import { ApiError, getJson, isUnauthorized, SessionDetailDto } from "../lib/api";
import { formatDatum, formatUhrzeit } from "../lib/formatDate";
import { SESSION_STATUS_LABEL, SESSION_STATUS_TONE } from "../lib/sessionStatus";
import { ROUTES } from "../routes";

type LoadState = "loading" | "loaded" | "not-found" | "error";

export default function SessionDetailPage() {
  const navigate = useNavigate();
  const { sessionId } = useParams<{ sessionId: string }>();
  const [session, setSession] = useState<SessionDetailDto | null>(null);
  const [loadState, setLoadState] = useState<LoadState>("loading");

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

  return (
    <Modal className="max-w-lg p-8" onClose={() => navigate(ROUTES.DOZENT_SESSIONS)}>
      {() => (
        <>
          {loadState === "error" && <Alert tone="error">Konnte Session nicht laden.</Alert>}
          {loadState === "not-found" && <Alert tone="error">Diese Session existiert nicht.</Alert>}
          {loadState === "loading" && <p className="text-sm text-gray-500">Lädt...</p>}

          {loadState === "loaded" && session && (
            <div className="flex flex-col gap-6">
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

              {/* Live-Ansicht / Moderation Integration */}
              <div className="flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50 p-4">
                <div>
                  <h3 className="font-semibold text-gray-900">Live-Ansicht</h3>
                  <p className="text-sm text-gray-500">Öffne die Live-Ansicht mit Fragen &amp; Umfragen</p>
                </div>
                <button
                  onClick={() => {
                    navigate(`/dozent/sessions/${sessionId}/live`);
                  }}
                  className="rounded-lg bg-pink-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-pink-700"
                >
                  Moderation öffnen
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </Modal>
  );
}