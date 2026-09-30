import { QRCodeSVG } from "qrcode.react";
import { useEffect, useRef, useState, useCallback } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { Modal } from "../components/ui";
import { ActiveSessionDto, getJson, SessionByCodeDto } from "../lib/api";
import { ROLE } from "../lib/role";
import { getStoredSession } from "../lib/session";
import { ROUTES } from "../routes";
import QuestionsEdit from "./questions/questions_edit"; // Adjust this relative path if needed (e.g., "./questions_edit" or "../components/questions_edit")

const TABS = [
  { id: "questions", label: "Fragenfeed", path: "questions" },
  { id: "umfrage", label: "Umfrage", path: "umfrage" },
  { id: "archiv", label: "Archiv", path: "archiv" },
] as const;

const SYNC_INTERVAL_MS = 8000;

interface ExtendedActiveSession extends ActiveSessionDto {
  startTime?: string;
  endTime?: string;
  participantCount?: number;
  teacherName?: string;
  teacherInitials?: string;
}

interface Question {
  id: number;
  author: string;
  time: string;
  text: string;
  tag: string;
  topic?: string;
  slideNumber?: number;
  comments: number;
  votes: number;
  voted: boolean;
  status?: "neu" | "gefragt" | "beantwortet";
}

interface NavigationPageProps {
  isDozent?: boolean;
  onBack?: () => void;
}

export default function NavigationPage({
  isDozent = false,
  onBack,
}: NavigationPageProps) {
  const [isContentScrolling, setIsContentScrolling] = useState(false);
  const scrollEndTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [headerData, setHeaderData] = useState<ExtendedActiveSession | null>(null);
  const [showQrCode, setShowQrCode] = useState(false);
  
  // State for Questions Edit view inside the left pane
  const [isQuestionsEditOpen, setIsQuestionsEditOpen] = useState(false);
  const [questionsState, setQuestionsState] = useState<Question[]>([]);
  
  const location = useLocation();
  const navigate = useNavigate();

  const isQuestionsView = location.pathname.endsWith("questions");

  // Listen to the custom event triggered from the header button
  useEffect(() => {
    const handleOpenEdit = () => {
      setIsQuestionsEditOpen(true);
    };

    window.addEventListener("open-questions-edit", handleOpenEdit);
    return () => {
      window.removeEventListener("open-questions-edit", handleOpenEdit);
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    const loadHeaderData = async () => {
      const storedSession = getStoredSession();

      try {
        if (storedSession?.role === ROLE.STUDENT && storedSession.sessionCode) {
          const session = await getJson<SessionByCodeDto>(`/api/sessions/by-code/${storedSession.sessionCode}`);
          if (!cancelled) {
            setHeaderData(session as unknown as ExtendedActiveSession);
          }
          return;
        }

        if (storedSession?.role === ROLE.DOZENT) {
          const session = await getJson<ExtendedActiveSession | null>("/api/sessions/active");
          if (!cancelled) {
            setHeaderData(session);
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

  const handleContentScroll = useCallback(() => {
    setIsContentScrolling(true);
    if (scrollEndTimeout.current) clearTimeout(scrollEndTimeout.current);
    scrollEndTimeout.current = setTimeout(() => setIsContentScrolling(false), 1000);
  }, []);

  useEffect(() => {
    return () => {
      if (scrollEndTimeout.current) clearTimeout(scrollEndTimeout.current);
    };
  }, []);

  const visibleTabs = TABS.filter((tab) => !(isDozent && tab.id === "archiv"));

  return (
    <div className="relative flex h-[100dvh] w-full overflow-hidden bg-white isolate">
      {/* Linker Bereich: Navigation, Tabs und Hauptinhalt */}
      <div className="flex flex-1 flex-col h-full min-w-0 overflow-hidden bg-gray-50">
        <header className="shrink-0 border-b border-gray-200 bg-white px-6 py-4 shadow-sm z-10">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              {isDozent && (
                <button
                  onClick={onBack ?? (() => navigate(ROUTES.DOZENT_DASHBOARD))}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-pink-600 hover:bg-pink-50 transition-colors cursor-pointer"
                  title="Zurück"
                >
                  <span className="text-2xl font-bold leading-none">‹</span>
                </button>
              )}
              
              <nav aria-label="Bereiche" className="flex items-center space-x-8">
                {visibleTabs.map((tab) => (
                  <NavLink
                    key={tab.id}
                    to={tab.path}
                    end
                    className={({ isActive }) =>
                      `relative pb-1 text-base font-medium transition-colors ${
                        isActive
                          ? "font-semibold text-gray-900 after:absolute after:-bottom-4 after:left-0 after:right-0 after:h-1 after:rounded-t-full after:bg-pink-600"
                          : "text-gray-500 hover:text-gray-700"
                      }`
                    }
                  >
                    {tab.label}
                  </NavLink>
                ))}
              </nav>
            </div>

            {isDozent && isQuestionsView && !isQuestionsEditOpen && (
              <button
                onClick={() => window.dispatchEvent(new CustomEvent("open-questions-edit"))}
                className="rounded-full bg-pink-600 px-5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-pink-700 transition-colors cursor-pointer"
              >
                Fragen bearbeiten
              </button>
            )}
          </div>
        </header>

        {/* Hauptinhaltsbereich */}
        <main
          onScroll={handleContentScroll}
          className={`relative min-h-0 flex-1 overflow-y-auto overflow-x-hidden p-6 scrollbar-fade ${
            isContentScrolling ? "scrollbar-fade-visible" : ""
          }`}
        >
          {isQuestionsEditOpen ? (
            <QuestionsEdit
              questions={questionsState}
              onClose={() => setIsQuestionsEditOpen(false)}
              onUpdateQuestions={setQuestionsState}
            />
          ) : (
            <Outlet />
          )}
        </main>
      </div>

      {/* Rechter Dozenten-Sidebar */}
      {isDozent && (
        <aside className="hidden lg:flex w-96 flex-col border-l border-gray-200 bg-white p-6 justify-between shrink-0 h-full shadow-2xl z-40 pointer-events-auto">
          <div className="flex flex-col items-center text-center overflow-y-auto overflow-x-hidden">
            <h2 className="text-xs font-bold uppercase tracking-wider text-gray-500">
              {headerData?.veranstaltungName ?? "Veranstaltung"}
            </h2>
            <p className="mt-2 text-3xl font-extrabold tracking-tight text-pink-600">
              #{headerData?.code ?? "------"}
            </p>

            <div 
              className="mt-6 rounded-2xl border border-gray-100 bg-gray-50 p-4 shadow-sm cursor-pointer" 
              onClick={() => setShowQrCode(true)}
            >
              {headerData?.code ? (
                <QRCodeSVG value={headerData.code} size={180} />
              ) : (
                <div className="h-[180px] w-[180px] bg-gray-200 animate-pulse rounded" />
              )}
              <p className="mt-3 text-xs text-gray-400">
                zwischenfrage.app/{headerData?.code ?? ""}
              </p>
            </div>

            <div className="mt-6 w-full space-y-3 text-sm border-t border-gray-100 pt-4">
              <div className="flex justify-between items-center text-gray-500">
                <span>Session</span>
                <span className="font-semibold text-gray-900">{headerData?.name ?? "Aktive Session"}</span>
              </div>
              <div className="flex justify-between items-center text-gray-500">
                <span>Zeit</span>
                <span className="font-semibold text-gray-900">
                  {headerData?.startTime && headerData?.endTime 
                    ? `${headerData.startTime} – ${headerData.endTime}` 
                    : "10:15 – 11:45"}
                </span>
              </div>
              <div className="flex justify-between items-center text-gray-500">
                <span>Teilnehmende</span>
                <span className="font-semibold text-gray-900">{headerData?.participantCount ?? 23}</span>
              </div>
            </div>
          </div>

          <div className="mt-4 space-y-4 border-t border-gray-100 pt-4 bg-white shrink-0">
            <div className="flex items-center justify-center">
              <div className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-1.5 text-sm shadow-sm">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-pink-600 text-xs font-bold text-white">
                  {headerData?.teacherInitials ?? "NH"}
                </span>
                <span className="font-medium text-gray-900">
                  {headerData?.teacherName ?? "Nils Hellwig · Dozi"}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => window.dispatchEvent(new CustomEvent("open-end-session-modal"))}
              className="w-full flex items-center justify-center gap-2 rounded-full border border-pink-200 bg-white py-2.5 text-sm font-semibold text-pink-600 shadow-sm transition-colors hover:bg-pink-50 cursor-pointer"
            >
              <span className="h-3.5 w-3.5 rounded border border-pink-600 inline-flex items-center justify-center">
                <span className="h-1.5 w-1.5 bg-pink-600 rounded-2xs" />
              </span>
              Session beenden
            </button>
          </div>
        </aside>
      )}

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
                className="mt-6 text-sm font-medium text-gray-500 hover:text-gray-700 cursor-pointer"
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