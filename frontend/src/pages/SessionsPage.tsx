import { Calendar, Plus } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { Alert, Badge, Button, Card, DashboardLayout, EmptyState, SegmentedControl, Select } from "../components/ui";
import { DozentDto, getJson, isUnauthorized, SessionSummaryDto } from "../lib/api";
import { DOZENT_NAV_ITEMS } from "../lib/dozentNav";
import { formatDatum } from "../lib/formatDate";
import { SESSION_STATUS_LABEL, SESSION_STATUS_TONE, SessionStatus } from "../lib/sessionStatus";
import { buildSessionDetailPath, ROUTES } from "../routes";

type LoadState = "loading" | "loaded" | "error";
type StatusFilter = "ALLE" | SessionStatus;

const ALLE_VERANSTALTUNGEN = "ALLE";

const STATUS_FILTER_OPTIONS: { value: StatusFilter; label: string }[] = [
  { value: "ALLE", label: "Alle" },
  { value: "LAUFEND", label: "Aktiv" },
  { value: "GEPLANT", label: "Geplant" },
  { value: "BEENDET", label: "Beendet" },
];

export interface SessionsPageContext {
  reloadSessions: () => void;
}

export default function SessionsPage() {
  const navigate = useNavigate();
  const [dozent, setDozent] = useState<DozentDto | null>(null);
  const [sessions, setSessions] = useState<SessionSummaryDto[]>([]);
  const [loadState, setLoadState] = useState<LoadState>("loading");
  const [veranstaltungFilter, setVeranstaltungFilter] = useState(ALLE_VERANSTALTUNGEN);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALLE");

  const load = () => {
    Promise.all([getJson<DozentDto>("/api/auth/me"), getJson<SessionSummaryDto[]>("/api/sessions")])
      .then(([dozentData, sessionsData]) => {
        setDozent(dozentData);
        setSessions(sessionsData);
        setLoadState("loaded");
      })
      .catch((err) => {
        if (isUnauthorized(err)) {
          navigate(ROUTES.LOGIN);
          return;
        }
        setLoadState("error");
      });
  };

  useEffect(load, [navigate]);

  const veranstaltungen = useMemo(() => {
    const byId = new Map<number, string>();
    sessions.forEach((session) => byId.set(session.veranstaltungId, session.veranstaltungName));
    return Array.from(byId, ([id, name]) => ({ id, name }));
  }, [sessions]);

  const filteredSessions = sessions.filter(
    (session) =>
      (veranstaltungFilter === ALLE_VERANSTALTUNGEN || session.veranstaltungId === Number(veranstaltungFilter)) &&
      (statusFilter === "ALLE" || session.status === statusFilter)
  );

  return (
    <DashboardLayout
      navItems={DOZENT_NAV_ITEMS}
      activeNavKey="sessions"
      title="Sessions"
      userName={dozent ? `${dozent.vorname} ${dozent.nachname}` : ""}
      headerAction={
        <Button
          variant="primary"
          className="flex w-auto items-center gap-2 px-4"
          onClick={() => navigate(ROUTES.DOZENT_SESSION_NEW)}
        >
          <Plus className="h-4 w-4" />
          Neue Session
        </Button>
      }
    >
      {loadState === "error" && <Alert tone="error">Konnte Sessions nicht laden.</Alert>}

      {loadState === "loaded" && sessions.length === 0 && (
        <Card>
          <EmptyState
            icon={Calendar}
            title="Noch keine Session"
            description="Lege deine erste Session für eine Veranstaltung an."
          />
        </Card>
      )}

      {sessions.length > 0 && (
        <>
          <div className="mb-4 flex flex-wrap items-center gap-3">
            <Select
              aria-label="Nach Veranstaltung filtern"
              value={veranstaltungFilter}
              onChange={(event) => setVeranstaltungFilter(event.target.value)}
              className="w-auto"
            >
              <option value={ALLE_VERANSTALTUNGEN}>Alle Veranstaltungen</option>
              {veranstaltungen.map((veranstaltung) => (
                <option key={veranstaltung.id} value={veranstaltung.id}>
                  {veranstaltung.name}
                </option>
              ))}
            </Select>
            <SegmentedControl
              aria-label="Nach Status filtern"
              options={STATUS_FILTER_OPTIONS}
              value={statusFilter}
              onChange={setStatusFilter}
            />
          </div>

          {filteredSessions.length === 0 ? (
            <Card>
              <EmptyState icon={Calendar} title="Keine Sessions gefunden" description="Passe die Filter an." />
            </Card>
          ) : (
            <Card className="overflow-x-auto !p-0">
              <table className="w-full min-w-[560px] text-left text-sm">
                <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-400">
                  <tr>
                    <th className="px-4 py-3 font-medium">Session</th>
                    <th className="px-4 py-3 font-medium">Veranstaltung</th>
                    <th className="px-4 py-3 font-medium">Datum</th>
                    <th className="px-4 py-3 font-medium">Code</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSessions.map((session) => (
                    <tr
                      key={session.id}
                      onClick={() => navigate(buildSessionDetailPath(session.id))}
                      className="cursor-pointer border-t border-gray-100 hover:bg-gray-50"
                    >
                      <td className="px-4 py-3 font-semibold text-gray-900">{session.name}</td>
                      <td className="px-4 py-3 text-gray-500">{session.veranstaltungName}</td>
                      <td className="px-4 py-3 text-gray-500">{formatDatum(session.datum)}</td>
                      <td className="px-4 py-3 text-gray-500">{session.code}</td>
                      <td className="px-4 py-3">
                        <Badge tone={SESSION_STATUS_TONE[session.status]}>
                          {SESSION_STATUS_LABEL[session.status]}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          )}
        </>
      )}

      <Outlet context={{ reloadSessions: load } satisfies SessionsPageContext} />
    </DashboardLayout>
  );
}
