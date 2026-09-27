import { Archive } from "lucide-react";

export default function Archiv() {
  const archiveItems = [
    { id: 1, title: "Session 2: Grundlagen & Einführung", date: "Vor 1 Woche", questionsCount: 18 },
    { id: 2, title: "Session 1: Organisatorisches", date: "Vor 2 Wochen", questionsCount: 12 },
  ];

  return (
    <div className="space-y-3 animate-fade-in motion-reduce:animate-none">
      <h2 className="px-1 text-xs font-bold uppercase tracking-wider text-gray-400">
        Vergangene Sessions
      </h2>
      {archiveItems.map((item) => (
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
      ))}
    </div>
  );
}
