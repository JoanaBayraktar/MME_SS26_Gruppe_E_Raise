import { useEffect, useRef, useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { ROUTES } from "../routes";

const TABS = [
  { id: "questions", label: "Fragen", path: "questions" },
  { id: "umfrage", label: "Umfrage", path: "umfrage" },
  { id: "archiv", label: "Archiv", path: "archiv" },
] as const;

interface NavigationPageProps {
  isDozent?: boolean;
  courseName?: string;
  sessionTitle?: string;
  courseCode?: string;
  onBack?: () => void;
}

export default function NavigationPage({
  isDozent = false,
  courseName = "MME Blockkurs",
  sessionTitle = "Session 3 · Mo 10:15",
  courseCode = "#2468",
  onBack,
}: NavigationPageProps) {
  const [isContentScrolling, setIsContentScrolling] = useState(false);
  const scrollEndTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  
  const location = useLocation();
  const navigate = useNavigate();

  // Prüft flexibel, ob wir uns aktuell in der Fragenansicht befinden
  const isQuestionsView = location.pathname.endsWith("questions");

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

  // Archiv-Tab für Dozenten ausblenden
  const visibleTabs = TABS.filter(
    (tab) => !(isDozent && tab.id === "archiv")
  );

  return (
    <div className="flex h-[100dvh] w-full flex-col overflow-hidden bg-white">
      <header className="shrink-0 border-b border-gray-200 bg-white px-5 pb-0 pt-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Zurück-Button für Dozenten */}
            {isDozent && (
              <button
                onClick={onBack ?? (() => navigate(ROUTES.DOZENT_DASHBOARD))}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
                title="Zurück"
              >
                <span className="text-lg font-bold leading-none">‹</span>
              </button>
            )}
            <div>
              <h1 className="text-xl font-bold tracking-tight text-gray-900">{courseName}</h1>
              <p className="mt-0.5 text-sm text-gray-500">{sessionTitle}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* "Fragen bearbeiten" Button – nur sichtbar für Dozenten in der Fragenansicht */}
            {isDozent && isQuestionsView && (
              <button
                onClick={() => {
                  window.dispatchEvent(new CustomEvent("open-questions-edit"));
                }}
                className="rounded-full bg-pink-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-pink-700 transition-colors"
              >
                Fragen bearbeiten
              </button>
            )}

            <span className="rounded-full bg-pink-100 px-3 py-1 text-sm font-semibold text-pink-600">
              {courseCode}
            </span>
          </div>
        </div>

        <nav aria-label="Bereiche" className="mt-5 flex justify-center space-x-10">
          {visibleTabs.map((tab) => (
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
    </div>
  );
}