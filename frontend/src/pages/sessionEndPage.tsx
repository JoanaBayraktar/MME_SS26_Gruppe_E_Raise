import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card, Button, DashboardLayout } from "../components/ui";
import { DOZENT_NAV_ITEMS } from "../lib/dozentNav";
import { fetchSessionStats, exportSessionData, closeSession, SessionStatsDto } from "./questions/questionsService";
import { ROUTES } from "../routes";

export default function SessionEndedPage() {
  const { sessionId } = useParams<{ sessionId?: string }>();
  const navigate = useNavigate();

  const [stats, setStats] = useState<SessionStatsDto>({
    sessionName: "Session",
    totalQuestions: 0,
    totalPolls: 0,
    participantCount: 0,
  });
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Statistiken beim Laden der Komponente abrufen
  useEffect(() => {
    let cancelled = false;
    const loadStats = async () => {
      try {
        const data = await fetchSessionStats(sessionId);
        if (!cancelled && data) {
          setStats(data);
        }
      } catch (err) {
        console.error("Fehler beim Laden der Session-Stats:", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void loadStats();
    return () => {
      cancelled = true;
    };
  }, [sessionId]);

  // Option 1: Export (CSV/JSON-Download triggern)
  const handleExport = async () => {
    try {
      setActionLoading(true);
      const downloadUrl = await exportSessionData(sessionId);
      if (downloadUrl) {
        window.open(downloadUrl, "_blank");
      } else {
        // Fallback, falls kein Endpoint-Download vorliegt: Direktes JSON ausgeben oder Benachrichtigung
        alert("Export erfolgreich vorbereitet.");
      }
    } catch (err) {
      console.error("Export fehlgeschlagen:", err);
    } finally {
      setActionLoading(false);
    }
  };

  // Option 2: Session Schließen & Zur Übersicht
  const handleCloseAndOverview = async () => {
    try {
      setActionLoading(true);
      if (sessionId) {
        await closeSession(sessionId);
      }
      navigate(ROUTES.DOZENT_DASHBOARD);
    } catch (err) {
      console.error("Fehler beim Schließen der Session:", err);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <DashboardLayout
      navItems={DOZENT_NAV_ITEMS}
      activeNavKey="sessions"
      title="Session beendet"
    >
      <div className="flex flex-1 flex-col items-center justify-center py-12 text-center">
        {/* Success Icon */}
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 shadow-xs">
          <svg className="h-10 w-10" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <h2 className="mt-6 text-3xl font-extrabold tracking-tight text-gray-900">
          {stats.sessionName} wurde beendet
        </h2>
        <p className="mt-2 text-sm text-gray-500">
          Alle Fragen und Umfrageergebnisse wurden erfolgreich aufsummiert.
        </p>

        {/* Korrekt aufsummierte Statistik-Karten */}
        <div className="mt-8 grid grid-cols-3 gap-4 w-full max-w-xl">
          <Card className="p-6 text-center">
            <p className="text-3xl font-black text-pink-600">
              {loading ? "..." : stats.totalQuestions}
            </p>
            <p className="mt-1 text-xs font-medium text-gray-500">Fragen gesamt</p>
          </Card>
          <Card className="p-6 text-center">
            <p className="text-3xl font-black text-pink-600">
              {loading ? "..." : stats.participantCount}
            </p>
            <p className="mt-1 text-xs font-medium text-gray-500">Teilnehmende</p>
          </Card>
          <Card className="p-6 text-center">
            <p className="text-3xl font-black text-pink-600">
              {loading ? "..." : stats.totalPolls}
            </p>
            <p className="mt-1 text-xs font-medium text-gray-500">Umfragen</p>
          </Card>
        </div>

        {/* Aktions-Buttons nebeneinander: Export links, Schließen rechts */}
        <div className="mt-10 flex flex-row items-center justify-center gap-4 w-full max-w-md">
          <div className="flex-1">
            <Button
              variant="secondary"
              className="w-full"
              disabled={actionLoading}
              onClick={handleExport}
            >
              Export (CSV/JSON)
            </Button>
          </div>

          <div className="flex-1">
            <Button
              variant="primary"
              className="w-full"
              disabled={actionLoading}
              onClick={handleCloseAndOverview}
            >
              Zurück zur Übersicht
            </Button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}