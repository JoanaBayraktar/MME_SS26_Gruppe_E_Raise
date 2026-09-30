import { Archive } from "lucide-react";

type ArchiveItem = {
  id: number;
  title: string;
  date: string;
  questionsCount: number;
};

// Beispielmethode für angezeigte Elemente als Platzhalter für Datenbankabfrage
const getArchiveItems = (): ArchiveItem[] => [
  {
    id: 1,
    title: "Session 03",
    date: "12.06.2026",
    questionsCount: 10,
  },
  {
    id: 2,
    title: "Session 02",
    date: "05.06.2026",
    questionsCount: 8,
  },
];

export default function Archiv() {
  const archiveItems: ArchiveItem[] = []; getArchiveItems();

  return (
    <div className="space-y-3 animate-fade-in motion-reduce:animate-none">
      <h2 className="px-1 text-xs font-bold uppercase tracking-wider text-gray-400">
        Vergangene Sessions
      </h2>
      {archiveItems.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-gray-200 bg-white px-4 py-8 text-center text-sm text-gray-500">
          Keine vergangenen Sessions vorhanden.
        </p>
      ) : (
        archiveItems.map((item) => (
          <div
            key={item.id}
            className="flex items-center justify-between rounded-2xl border border-gray-100 bg-white p-4 shadow-sm"
          >
            <div>
              <h3 className="text-sm font-semibold text-gray-900">{item.title}</h3>
              <p className="mt-0.5 text-xs text-gray-500">
                {item.date} · {item.questionsCount} Fragen beantwortet
              </p>
            </div>
            <button
              type="button"
              aria-label={`Archivierte Session öffnen: ${item.title}`}
              className="rounded-xl border border-gray-200 bg-gray-50 p-2 text-gray-600 hover:bg-gray-100"
            >
              <Archive className="h-4 w-4" />
            </button>
          </div>
        ))
      )}
    </div>
  );
}
