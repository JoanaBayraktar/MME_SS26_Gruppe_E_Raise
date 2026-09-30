import { ArrowRight, Folder, Plus, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Alert,
  Badge,
  Button,
  Card,
  DashboardLayout,
  EmptyState,
} from "../components/ui";
import {
  ActiveSessionDto,
  DozentDto,
  getJson,
  isUnauthorized,
  VeranstaltungSummaryDto,
} from "../lib/api";
import { DOZENT_NAV_ITEMS } from "../lib/dozentNav";
import {
  SESSION_STATUS_LABEL,
  SESSION_STATUS_TONE,
} from "../lib/sessionStatus";
import { buildVeranstaltungDetailPath, ROUTES } from "../routes";

type LoadState = "loading" | "loaded" | "error";

export default function DozentDashboardPage() {
  const navigate = useNavigate();
  const [dozent, setDozent] = useState<DozentDto | null>(null);
  const [veranstaltungen, setVeranstaltungen] = useState<
    VeranstaltungSummaryDto[]
  >([]);
  const [activeSession, setActiveSession] = useState<ActiveSessionDto | null>(
    null,
  );
  const [loadState, setLoadState] = useState<LoadState>("loading");

  useEffect(() => {
    Promise.all([
      getJson<DozentDto>("/api/auth/me"),
      getJson<VeranstaltungSummaryDto[]>("/api/veranstaltungen"),
      getJson<ActiveSessionDto | null>("/api/sessions/active"),
    ])
      .then(([dozentData, veranstaltungenData, activeSessionData]) => {
        setDozent(dozentData);
        setVeranstaltungen(veranstaltungenData);
        setActiveSession(activeSessionData);
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
      activeNavKey="veranstaltungen"
      title="Veranstaltungen"
      userName={dozent ? `${dozent.vorname} ${dozent.nachname}` : ""}
      headerAction={
        <Button
          variant="primary"
          className="flex w-auto items-center gap-2 px-4"
          onClick={() => navigate(ROUTES.DOZENT_VERANSTALTUNG_NEW)}
        >
          <Plus className="h-4 w-4" />
          Veranstaltung anlegen
        </Button>
      }
    >
      {loadState === "error" && (
        <Alert tone="error">Konnte Dashboard nicht laden.</Alert>
      )}

      {loadState === "loaded" && veranstaltungen.length === 0 && (
        <Card>
          <EmptyState
            icon={Folder}
            title="Noch keine Veranstaltung"
            description="Lege deine erste Veranstaltung an, um Sessions zu erstellen."
          />
        </Card>
      )}

      {veranstaltungen.length > 0 && (
        <Card className="overflow-x-auto !p-0">
          <table className="w-full min-w-[480px] text-left text-sm">
            <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-400">
              <tr>
                <th className="px-4 py-3 font-medium">Veranstaltung</th>
                <th className="px-4 py-3 font-medium">Kürzel</th>
                <th className="px-4 py-3 font-medium">Sessions</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Verwaltung</th>
              </tr>
            </thead>
            <tbody>
              {veranstaltungen.map((veranstaltung) => (
                <tr
                  key={veranstaltung.id}
                  onClick={() =>
                    navigate(
                      `${ROUTES.DOZENT_SESSIONS}?veranstaltung=${veranstaltung.id}`,
                    )
                  }
                  className="cursor-pointer border-t border-gray-100 hover:bg-gray-50"
                >
                  <td className="px-4 py-3 font-semibold text-gray-900">
                    {veranstaltung.name}
                  </td>

                  <td className="px-4 py-3 text-gray-500">
                    {veranstaltung.kuerzel}
                  </td>

                  <td className="px-4 py-3 text-gray-500">
                    {veranstaltung.sessionCount} Sessions
                  </td>

                  <td className="px-4 py-3">
                    <Badge tone={SESSION_STATUS_TONE[veranstaltung.status]}>
                      {SESSION_STATUS_LABEL[veranstaltung.status]}
                    </Badge>
                  </td>

                  <td className="px-4 py-3">
                    <Button
                      type="button"
                      variant="outline"
                      className="flex w-auto items-center gap-2 px-3"
                      onClick={(event) => {
                        // verhindert dass gleichzeitig die session übersicht geöffnet wird
                        event.stopPropagation();
                        navigate(
                          buildVeranstaltungDetailPath(veranstaltung.id),
                        );
                      }}
                    >
                      <Users className="h-4 w-4" />
                      Dozent:innen
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      {activeSession && (
        <div className="mt-8">
          <h2 className="mb-3 text-sm font-semibold text-gray-900">
            Aktuelle Session
          </h2>

          <Card className="flex items-center justify-between gap-4">
            <div>
              <p className="font-semibold text-gray-900">
                {activeSession.name}
              </p>
              <p className="text-sm text-gray-500">
                {activeSession.veranstaltungName}
              </p>

              <div className="mt-2">
                <Badge tone="brand">{activeSession.code}</Badge>
              </div>
            </div>

            <Button
              variant="primary"
              className="flex !w-auto items-center gap-2 px-4"
              onClick={() =>
                navigate(`${ROUTES.DOZENT_SESSIONS}/${activeSession.id}`)
              }
            >
              Aktuelle Session / Moderation
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Card>
        </div>
      )}
    </DashboardLayout>
  );
}
