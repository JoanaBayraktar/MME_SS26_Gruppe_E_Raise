import { useState, useEffect } from "react";
import { ArrowLeft, Calendar, BookOpen, MessageSquare, CheckCircle2 } from "lucide-react";
import { getJson } from "../../lib/api";

interface ArchivedEntryDto {
  id: number;
  veranstaltungId: number;
  veranstaltungName: string;
  kapitel: string | null;
  folienNr: number | null;
  frageText: string;
  antwortText: string | null;
  erstelltAm: string;
}

interface SingleArchiveViewProps {
  veranstaltungId: number;
  onBack: () => void;
}

export default function SingleArchiveView({ veranstaltungId, onBack }: SingleArchiveViewProps) {
  const [entries, setEntries] = useState<ArchivedEntryDto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    // Fetch all entries and filter by veranstaltungId, or call a dedicated endpoint like `/api/archiv/veranstaltung/${veranstaltungId}`
    getJson<ArchivedEntryDto[]>(`/api/archiv`)
      .then((data) => {
        if (isMounted && data) {
          const filtered = data.filter((e) => e.veranstaltungId === veranstaltungId);
          setEntries(filtered);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error("Fehler beim Laden der Veranstaltungs-Historie:", err);
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [veranstaltungId]);

  const veranstaltungName = entries.length > 0 ? entries[0].veranstaltungName : "Veranstaltung";

  return (
    <div className="space-y-6 animate-fade-in motion-reduce:animate-none">
      {/* Header with back button */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center justify-center h-10 w-10 rounded-full border border-gray-200 bg-white text-gray-700 shadow-2xs hover:bg-gray-50 cursor-pointer transition-colors"
          title="Zurück zur Übersicht"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div>
          <span className="text-xs font-semibold text-pink-600 uppercase tracking-wider">Archiv-Historie</span>
          <h2 className="text-xl font-bold text-gray-900">{veranstaltungName}</h2>
        </div>
      </div>

      {/* Content list */}
      {loading ? (
        <p className="rounded-2xl border border-dashed border-gray-200 bg-white px-4 py-12 text-center text-sm text-gray-500 animate-pulse">
          Lade Veranstaltungs-Historie...
        </p>
      ) : entries.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-gray-200 bg-white px-4 py-12 text-center text-sm text-gray-500">
          Keine archivierten Einträge für diese Veranstaltung gefunden.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {entries.map((entry) => (
            <div
              key={entry.id}
              className="flex flex-col gap-3 rounded-2xl border border-gray-100 bg-white p-5 shadow-xs transition-all"
            >
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  {entry.folienNr && (
                    <span className="inline-block text-xs font-semibold text-pink-600 bg-pink-50 px-2.5 py-0.5 rounded-full">
                      Folie {entry.folienNr}
                    </span>
                  )}
                  <h3 className="text-base font-semibold text-gray-900 mt-1">
                    {entry.frageText}
                  </h3>
                </div>
              </div>

              {entry.antwortText ? (
                <div className="text-sm text-gray-700 bg-gray-50 p-4 rounded-xl border border-gray-100 space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-900">
                    <CheckCircle2 className="h-4 w-4 text-pink-600" />
                    <span>Dozenten-Antwort:</span>
                  </div>
                  <p className="pl-5 text-gray-600">{entry.antwortText}</p>
                </div>
              ) : (
                <p className="text-xs italic text-gray-400">Noch keine offizielle Antwort hinterlegt.</p>
              )}

              <div className="flex items-center gap-2 pt-2 border-t border-gray-50">
                {entry.kapitel && (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-gray-50/50 px-3 py-1 text-xs font-medium text-gray-600">
                    <BookOpen className="h-3 w-3 text-gray-400" />
                    {entry.kapitel}
                  </span>
                )}
                <span className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-gray-50/50 px-3 py-1 text-xs font-medium text-gray-600">
                  <Calendar className="h-3 w-3 text-gray-400" />
                  {new Date(entry.erstelltAm).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}