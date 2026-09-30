import { QrCode } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { useEffect, useRef, useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import { Modal } from "../components/ui";
import { ActiveSessionDto, getJson, SessionByCodeDto } from "../lib/api";
import { ROLE } from "../lib/role";
import { getStoredSession } from "../lib/session";
import { ROUTES } from "../routes";

const TABS = [
  { id: "questions", label: "Fragen", path: ROUTES.QUESTIONS },
  { id: "umfrage", label: "Umfrage", path: ROUTES.UMFRAGE },
  { id: "archiv", label: "Archiv", path: ROUTES.ARCHIV },
] as const;

// Wie oft die Header-Daten neu geladen werden, damit sie mit der
// tatsächlichen Session synchron bleiben (z. B. wenn der Dozent die Session
// beendet oder eine neue startet), ohne eine eigene Websocket-Verbindung
// aufzubauen.
const SYNC_INTERVAL_MS = 8000;

interface HeaderSessionData {
  veranstaltungName: string;
  sessionName: string;
  code: string;
}

export default function NavigationPage() {
  const [isContentScrolling, setIsContentScrolling] = useState(false);
  const scrollEndTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [headerData, setHeaderData] = useState<HeaderSessionData | null>(null);
  const [showQrCode, setShowQrCode] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const loadHeaderData = async () => {
      const storedSession = getStoredSession();

      try {
        if (storedSession?.role === ROLE.STUDENT && storedSession.sessionCode) {
          const session = await getJson<SessionByCodeDto>(`/api/sessions/by-code/${storedSession.sessionCode}`);
          if (!cancelled) {
            setHeaderData({ veranstaltungName: session.veranstaltungName, sessionName: session.name, code: session.code });
          }
          return;
        }

        if (storedSession?.role === ROLE.DOZENT) {
          const session = await getJson<ActiveSessionDto | null>("/api/sessions/active");
          if (!cancelled) {
            setHeaderData(
              session
                ? { veranstaltungName: session.veranstaltungName, sessionName: session.name, code: session.code }
                : null
            );
          }
        }
      } catch {
        if (!cancelled) setHeaderData(null);
      }
    };

    void loadHeaderData();
    const interval = setInterval(loadHeaderData, SYNC_INTERVAL_MS);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  const handleContentScroll = () => {
    setIsContentScrolling(true);

    if (scrollEndTimeout.current) {
      clearTimeout(scrollEndTimeout.current);
    }

    scrollEndTimeout.current = setTimeout(() => {
      setIsContentScrolling(false);
    }, 1000);
  };

  useEffect(() => {
    return () => {
      if (scrollEndTimeout.current) {
        clearTimeout(scrollEndTimeout.current);
      }
    };
  }, []);

  return (
    <div className="flex h-[100dvh] w-full flex-col overflow-hidden bg-white">
      <header className="shrink-0 border-b border-gray-200 bg-white px-5 pb-0 pt-4 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <h1 className="truncate text-xl font-bold tracking-tight text-gray-900">
              {headerData?.veranstaltungName ?? "MME Blockkurs"}
            </h1>
            <p className="mt-0.5 truncate text-sm text-gray-500">{headerData?.sessionName ?? "Keine aktive Sitzung"}</p>
          </div>

          {headerData && (
            <button
              type="button"
              onClick={() => setShowQrCode(true)}
              className="flex shrink-0 items-center gap-1.5 rounded-full bg-pink-100 px-3 py-1 text-sm font-semibold text-pink-600 transition hover:bg-pink-200"
            >
              <QrCode className="h-4 w-4" aria-hidden />
              {headerData.code}
            </button>
          )}
        </div>

        <nav aria-label="Bereiche" className="mt-5 flex justify-center space-x-10">
          {TABS.map((tab) => (
            <NavLink
              key={tab.id}
              to={tab.path}
              end
              className={({ isActive }) =>
                `relative pb-3 text-base font-medium transition-colors ${
                  isActive
                    ? "font-semibold text-pink-600 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-1 after:animate-fade-in after:rounded-t-full after:bg-pink-600"
                    : "text-gray-500 hover:text-gray-700"
                }`
              }
            >
              {tab.label}
            </NavLink>
          ))}
        </nav>
      </header>

      <main
        onScroll={handleContentScroll}
        className={`min-h-0 flex-1 overflow-y-auto bg-gray-50 p-4 pb-20 scrollbar-fade ${
          isContentScrolling ? "scrollbar-fade-visible" : ""
        }`}
      >
        <Outlet />
      </main>

      {showQrCode && headerData && (
        <Modal className="max-w-xs p-6 text-center" onClose={() => setShowQrCode(false)}>
          {(close) => (
            <>
              <h2 className="text-lg font-bold text-gray-900">{headerData.veranstaltungName}</h2>
              <p className="mt-1 text-sm text-gray-500">Zum Beitreten scannen</p>
              <div className="mt-4 flex justify-center rounded-2xl bg-gray-50 p-4">
                <QRCodeSVG value={headerData.code} size={200} />
              </div>
              <p className="mt-4 text-2xl font-bold tracking-widest text-brand">{headerData.code}</p>
              <button
                type="button"
                onClick={close}
                className="mt-6 text-sm font-medium text-gray-500 hover:text-gray-700"
              >
                Schließen
              </button>
            </>
          )}
        </Modal>
      )}
    </div>
  );
}
