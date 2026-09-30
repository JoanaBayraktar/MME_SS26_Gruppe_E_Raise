import { RefreshCw } from "lucide-react";
import {
  type TouchEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { ActiveUmfrageDto, getJson, SessionByCodeDto } from "../../lib/api";
import { ROLE } from "../../lib/role";
import { getStoredSession } from "../../lib/session";

const REFRESH_INTERVAL_MS = 5000;

export default function Umfrage() {
  const [umfrage, setUmfrage] = useState<ActiveUmfrageDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const touchStartY = useRef<number | null>(null);
  const [pullDistance, setPullDistance] = useState(0);

  // lädt die aktuell aktive umfrage für die beigetretene session
  const loadUmfrage = useCallback(async (showRefreshing = false) => {
    if (showRefreshing) {
      setIsRefreshing(true);
    }

    try {
      const storedSession = getStoredSession();

      if (storedSession?.role !== ROLE.STUDENT || !storedSession.sessionCode) {
        setUmfrage(null);
        return;
      }

      const session = await getJson<SessionByCodeDto>(
        `/api/sessions/by-code/${storedSession.sessionCode}`,
      );

      const activeUmfrage = await getJson<ActiveUmfrageDto | null>(
        `/api/umfragen/active?sessionId=${session.id}`,
      );

      setUmfrage(activeUmfrage);
    } catch {
      setUmfrage(null);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  // merkt sich den startpunkt wenn oben in der seite gezogen wird
  const handleTouchStart = (event: TouchEvent<HTMLDivElement>) => {
    const scrollContainer = event.currentTarget.closest("main");

    if (scrollContainer && scrollContainer.scrollTop <= 0) {
      touchStartY.current = event.touches[0].clientY;
    }
  };

  // misst wie weit nach unten gezogen wurde
  const handleTouchMove = (event: TouchEvent<HTMLDivElement>) => {
    if (touchStartY.current === null) return;

    const distance = event.touches[0].clientY - touchStartY.current;

    if (distance > 0) {
      setPullDistance(Math.min(distance, 80));
    }
  };

  // aktualisiert die umfrage sobald weit genug nach unten gezogen wurde
  const handleTouchEnd = () => {
    if (pullDistance >= 60) {
      void loadUmfrage(true);
    }

    touchStartY.current = null;
    setPullDistance(0);
  };

  useEffect(() => {
    void loadUmfrage();

    // prüft regelmäßig ob eine neue umfrage gestartet wurde
    const interval = setInterval(() => {
      void loadUmfrage();
    }, REFRESH_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [loadUmfrage]);

  if (isLoading) {
    return (
      <div className="rounded-2xl bg-white p-6 text-center text-sm text-gray-500">
        Umfrage wird geladen...
      </div>
    );
  }

  if (!umfrage) {
    return (
      <div
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className="rounded-2xl border border-dashed border-gray-200 bg-white p-8 text-center"
      >
        {pullDistance > 0 && (
          <p className="mb-4 text-xs text-gray-400">
            {pullDistance >= 60
              ? "Loslassen zum Aktualisieren"
              : "Zum Aktualisieren weiterziehen"}
          </p>
        )}
        <h2 className="text-lg font-semibold text-gray-900">
          Keine aktive Umfrage vorhanden
        </h2>

        <p className="mt-2 text-sm text-gray-500">
          Sobald eine neue Umfrage gestartet wird, erscheint sie automatisch
          hier.
        </p>

        <button
          type="button"
          onClick={() => void loadUmfrage(true)}
          disabled={isRefreshing}
          className="mt-5 inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
        >
          <RefreshCw
            className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`}
          />
          Aktualisieren
        </button>
      </div>
    );
  }

  return (
    <div
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className="rounded-2xl bg-white p-6"
    >
      {" "}
      <p className="text-sm font-medium text-pink-600">Aktive Umfrage</p>
      <h2 className="mt-2 text-lg font-bold text-gray-900">
        {umfrage.frageText}
      </h2>
    </div>
  );
}
