import { RefreshCw } from "lucide-react";
import {
  type TouchEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  ActiveUmfrageDto,
  ApiError,
  getJson,
  postJson,
  SessionByCodeDto,
  UmfrageErgebnisDto,
} from "../../lib/api";
import { ROLE } from "../../lib/role";
import { getStoredSession, getStudentToken } from "../../lib/session";
import { useNavigate } from "react-router-dom";

const REFRESH_INTERVAL_MS = 5000;

export default function Umfrage() {
  const navigate = useNavigate();

  const [umfrage, setUmfrage] = useState<ActiveUmfrageDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const touchStartY = useRef<number | null>(null);
  const [pullDistance, setPullDistance] = useState(0);
  const [selectedOptionIds, setSelectedOptionIds] = useState<number[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [voteMessage, setVoteMessage] = useState<string | null>(null);
  const [hasVoted, setHasVoted] = useState(false);
  const [ergebnis, setErgebnis] = useState<UmfrageErgebnisDto | null>(null);
  const [activeSessionId, setActiveSessionId] = useState<number | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newFrageText, setNewFrageText] = useState("");
  const [newTyp, setNewTyp] = useState<
    "SINGLE_CHOICE" | "MULTIPLE_CHOICE" | "SKALA"
  >("SINGLE_CHOICE");
  const [newAntwortoptionen, setNewAntwortoptionen] = useState(["", ""]);
  const [createMessage, setCreateMessage] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const storedSession = getStoredSession();
  const isDozent = storedSession?.role === ROLE.DOZENT;

  // lädt die aktuell aktive umfrage für die jeweilige session
  const loadUmfrage = useCallback(async (showRefreshing = false) => {
    if (showRefreshing) {
      setIsRefreshing(true);
    }

    try {
      const storedSession = getStoredSession();

      if (!storedSession) {
        setUmfrage(null);
        return;
      }

      // student:innen laden die session über den beitrittscode
      if (storedSession.role === ROLE.STUDENT && storedSession.sessionCode) {
        const session = await getJson<SessionByCodeDto>(
          `/api/sessions/by-code/${storedSession.sessionCode}`,
        );

        const activeUmfrage = await getJson<ActiveUmfrageDto | null>(
          `/api/umfragen/active?sessionId=${session.id}&studentToken=${encodeURIComponent(
            getStudentToken(),
          )}`,
        );

        setUmfrage(activeUmfrage);
        setHasVoted(activeUmfrage?.bereitsAbgestimmt ?? false);
        return;
      }

      // dozent:innen laden die aktuell aktive session
      if (storedSession.role === ROLE.DOZENT) {
        const session = await getJson<{
          id: number;
        } | null>("/api/sessions/active");

        if (!session) {
          setUmfrage(null);
          return;
        }

        setActiveSessionId(session.id);

        const activeUmfrage = await getJson<ActiveUmfrageDto | null>(
          `/api/umfragen/active?sessionId=${session.id}`,
        );

        setUmfrage(activeUmfrage);

        // dozent:innen sehen direkt die live ergebnisse
        setHasVoted(Boolean(activeUmfrage));

        return;
      }

      setUmfrage(null);
    } catch {
      setUmfrage(null);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  // lädt die aktuellen ergebnisse der umfrage
  const loadErgebnis = useCallback(async (umfrageId: number) => {
    try {
      const data = await getJson<UmfrageErgebnisDto>(
        `/api/umfragen/${umfrageId}/results`,
      );

      setErgebnis(data);
    } catch {
      setErgebnis(null);
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

  // erstellt und startet eine neue umfrage
  const handleCreateUmfrage = async () => {
    if (!activeSessionId || isCreating) return;

    const antwortoptionen = newAntwortoptionen
      .map((option) => option.trim())
      .filter(Boolean);

    if (!newFrageText.trim()) {
      setCreateMessage("Bitte gib eine Frage ein.");
      return;
    }

    if (antwortoptionen.length < 2) {
      setCreateMessage("Bitte gib mindestens zwei Antwortoptionen ein.");
      return;
    }

    setIsCreating(true);
    setCreateMessage(null);

    try {
      const createdUmfrage = await postJson<ActiveUmfrageDto>("/api/umfragen", {
        sessionId: activeSessionId,
        frageText: newFrageText.trim(),
        typ: newTyp,
        antwortoptionen,
      });

      setUmfrage(createdUmfrage);
      setHasVoted(true);
      setShowCreateForm(false);
      setNewFrageText("");
      setNewAntwortoptionen(["", ""]);
      await loadErgebnis(createdUmfrage.id);
    } catch (error) {
      setCreateMessage(
        error instanceof ApiError
          ? error.message
          : "Die Umfrage konnte nicht erstellt werden.",
      );
    } finally {
      setIsCreating(false);
    }
  };

  // wählt je nach umfragetyp eine oder mehrere optionen aus
  const handleOptionClick = (optionId: number) => {
    if (hasVoted) return;

    if (umfrage?.typ === "MULTIPLE_CHOICE") {
      setSelectedOptionIds((current) =>
        current.includes(optionId)
          ? current.filter((id) => id !== optionId)
          : [...current, optionId],
      );
      return;
    }

    setSelectedOptionIds([optionId]);
  };

  // sendet die ausgewählten antworten an das backend
  const handleVote = async () => {
    if (!umfrage || selectedOptionIds.length === 0 || isSubmitting) return;

    setIsSubmitting(true);
    setVoteMessage(null);

    try {
      const result = await postJson<{ message: string }>(
        `/api/umfragen/${umfrage.id}/vote`,
        {
          optionIds: selectedOptionIds,
          studentToken: getStudentToken(),
        },
      );

      setHasVoted(true);
      setVoteMessage(result.message);
      await loadErgebnis(umfrage.id);
    } catch (error) {
      if (error instanceof ApiError) {
        setVoteMessage(error.message);

        if (error.status === 409) {
          setHasVoted(true);
        }
      } else {
        setVoteMessage("Die Stimme konnte nicht abgegeben werden.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    void loadUmfrage();

    // prüft regelmäßig ob eine neue umfrage gestartet wurde
    const interval = setInterval(() => {
      void loadUmfrage();
    }, REFRESH_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [loadUmfrage]);

  // setzt die auswahl zurück wenn eine neue umfrage aktiv wird
  useEffect(() => {
    setSelectedOptionIds([]);
    setVoteMessage(null);
  }, [umfrage?.id]);

  // aktualisiert die ergebnisse regelmäßig nach der abstimmung
  useEffect(() => {
    if (!umfrage || !hasVoted) {
      setErgebnis(null);
      return;
    }

    void loadErgebnis(umfrage.id);

    const interval = setInterval(() => {
      void loadErgebnis(umfrage.id);
    }, REFRESH_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [hasVoted, loadErgebnis, umfrage]);

  if (isLoading) {
    return (
      <div className="rounded-2xl bg-white p-6 text-center text-sm text-gray-500">
        Umfrage wird geladen...
      </div>
    );
  }

  if (!umfrage) {
    if (isDozent && showCreateForm) {
      return (
        <div className="rounded-2xl bg-white p-6">
          <h2 className="text-lg font-semibold text-gray-900">
            Neue Umfrage erstellen
          </h2>

          <div className="mt-5 space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Frage
              </label>

              <input
                type="text"
                value={newFrageText}
                onChange={(event) => setNewFrageText(event.target.value)}
                placeholder="z. B. Welche Antwort ist richtig?"
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-pink-500"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Umfragetyp
              </label>

              <select
                value={newTyp}
                onChange={(event) =>
                  setNewTyp(
                    event.target.value as
                      | "SINGLE_CHOICE"
                      | "MULTIPLE_CHOICE"
                      | "SKALA",
                  )
                }
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-pink-500"
              >
                <option value="SINGLE_CHOICE">Single Choice</option>
                <option value="MULTIPLE_CHOICE">Multiple Choice</option>
                <option value="SKALA">Skala</option>
              </select>
            </div>

            <div className="space-y-3">
              <p className="text-sm font-medium text-gray-700">
                Antwortoptionen
              </p>

              {newAntwortoptionen.map((option, index) => (
                <input
                  key={index}
                  type="text"
                  value={option}
                  onChange={(event) =>
                    setNewAntwortoptionen((current) =>
                      current.map((item, itemIndex) =>
                        itemIndex === index ? event.target.value : item,
                      ),
                    )
                  }
                  placeholder={`Antwort ${index + 1}`}
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-pink-500"
                />
              ))}

              <button
                type="button"
                onClick={() =>
                  setNewAntwortoptionen((current) => [...current, ""])
                }
                className="text-sm font-medium text-pink-600"
              >
                + Antwort hinzufügen
              </button>
            </div>

            {createMessage && (
              <p className="text-sm text-red-600">{createMessage}</p>
            )}

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowCreateForm(false)}
                className="flex-1 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50"
              >
                Abbrechen
              </button>

              <button
                type="button"
                onClick={() => void handleCreateUmfrage()}
                disabled={isCreating}
                className="flex-1 rounded-xl bg-pink-600 px-4 py-3 text-sm font-semibold text-white hover:bg-pink-700 disabled:bg-gray-300"
              >
                {isCreating ? "Wird gestartet..." : "Umfrage starten"}
              </button>
            </div>
          </div>
        </div>
      );
    }

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
          {isDozent
            ? "Erstelle eine neue Umfrage für die laufende Session."
            : "Sobald eine neue Umfrage gestartet wird, erscheint sie automatisch hier."}
        </p>

        {isDozent ? (
          <button
            type="button"
            onClick={() => setShowCreateForm(true)}
            className="mt-5 rounded-xl bg-pink-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-pink-700"
          >
            Umfrage erstellen
          </button>
        ) : (
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
        )}
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
      <p className="text-sm font-medium text-pink-600">Aktive Umfrage</p>
      <h2 className="mt-2 text-lg font-bold text-gray-900">
        {umfrage.frageText}
      </h2>

      {hasVoted && ergebnis ? (
        <div className="mt-6 space-y-5">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-gray-900">
              Live-Ergebnisse
            </p>

            <p className="text-xs text-gray-500">
              {ergebnis.totalTeilnehmende} Teilnehmende
            </p>
          </div>

          <div className="space-y-4">
            {ergebnis.antwortoptionen.map((option) => (
              <div key={option.id}>
                <div className="mb-1 flex items-center justify-between gap-4">
                  <span className="text-sm text-gray-700">{option.text}</span>

                  <span className="shrink-0 text-sm font-medium text-gray-900">
                    {option.prozent}% ({option.stimmen})
                  </span>
                </div>

                <div className="h-3 overflow-hidden rounded-full bg-gray-100">
                  <div
                    className="h-full rounded-full bg-pink-500 transition-all duration-500"
                    style={{ width: `${Math.min(option.prozent, 100)}%` }}
                  />
                </div>
              </div>
            ))}

            <button
              type="button"
              onClick={() => navigate("../questions")}
              className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
            >
              Zurück zu den Fragen
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="mt-5 space-y-3">
            {umfrage.antwortoptionen.map((option) => {
              const isSelected = selectedOptionIds.includes(option.id);

              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => handleOptionClick(option.id)}
                  disabled={hasVoted}
                  className={`w-full rounded-xl border px-4 py-3 text-left text-sm transition ${
                    isSelected
                      ? "border-pink-500 bg-pink-50 text-pink-700"
                      : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
                  } disabled:cursor-not-allowed disabled:opacity-60`}
                >
                  {option.text}
                </button>
              );
            })}
          </div>

          <button
            type="button"
            onClick={() => void handleVote()}
            disabled={
              selectedOptionIds.length === 0 || isSubmitting || hasVoted
            }
            className="mt-5 w-full rounded-xl bg-pink-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-pink-700 disabled:cursor-not-allowed disabled:bg-gray-300"
          >
            {isSubmitting
              ? "Wird abgestimmt..."
              : hasVoted
                ? "Bereits abgestimmt"
                : "Abstimmen"}
          </button>

          {voteMessage && (
            <p className="mt-4 text-center text-sm text-gray-600">
              {voteMessage}
            </p>
          )}
        </>
      )}
    </div>
  );
}
