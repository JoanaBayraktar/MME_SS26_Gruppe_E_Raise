import { useEffect, useRef, useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import { ROUTES } from "../routes";

const TABS = [
  { id: "questions", label: "Fragen", path: ROUTES.QUESTIONS },
  { id: "umfrage", label: "Umfrage", path: ROUTES.UMFRAGE },
  { id: "archiv", label: "Archiv", path: ROUTES.ARCHIV },
] as const;

export default function NavigationPage() {
  const [isContentScrolling, setIsContentScrolling] = useState(false);
  const scrollEndTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-gray-900">MME Blockkurs</h1>
            <p className="mt-0.5 text-sm text-gray-500">Session 3 · Mo 10:15</p>
          </div>

          <span className="rounded-full bg-pink-100 px-3 py-1 text-sm font-semibold text-pink-600">
            #2468
          </span>
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
    </div>
  );
}
