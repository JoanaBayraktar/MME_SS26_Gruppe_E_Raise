import { Calendar, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Alert, Badge, Button, Card, DashboardLayout, EmptyState } from "../components/ui";
import { DozentDto, getJson, isUnauthorized, SessionSummaryDto } from "../lib/api";
import { DOZENT_NAV_ITEMS } from "../lib/dozentNav";
import { SESSION_STATUS_LABEL, SESSION_STATUS_TONE } from "../lib/sessionStatus";
import { ROUTES } from "../routes";

type LoadState = "loading" | "loaded" | "error";

export default function SessionsPage() {
  const navigate = useNavigate();
  const [dozent, setDozent] = useState<DozentDto | null>(null);
  const [sessions, setSessions] = useState<SessionSummaryDto[]>([]);
  const [loadState, setLoadState] = useState<LoadState>("loading");

  useEffect(() => {
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
  }, [navigate]);

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
        <Card className="overflow-x-auto !p-0">
          <table className="w-full min-w-[520px] text-left text-sm">
            <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-400">
              <tr>
                <th className="px-4 py-3 font-medium">Session</th>
                <th className="px-4 py-3 font-medium">Veranstaltung</th>
                <th className="px-4 py-3 font-medium">Code</th>
                <th className="px-4 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {sessions.map((session) => (
                <tr key={session.id} className="border-t border-gray-100">
                  <td className="px-4 py-3 font-semibold text-gray-900">{session.name}</td>
                  <td className="px-4 py-3 text-gray-500">{session.veranstaltungName}</td>
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
    </DashboardLayout>
  );
}
