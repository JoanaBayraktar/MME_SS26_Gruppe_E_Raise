import { useState } from "react";
import { X, Check, Trash2 } from "lucide-react";
import { updateQuestionStatus } from "../questions/questionsService";

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

interface QuestionsEditProps {
  questions: Question[];
  onClose: () => void;
  onUpdateQuestions: (updated: Question[]) => void;
}

type FilterTab = "Alle" | "Neu" | "Gefragt" | "Beantwortet";

export default function QuestionsEdit({ questions, onClose, onUpdateQuestions }: QuestionsEditProps) {
  const [activeTab, setActiveTab] = useState<FilterTab>("Alle");
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  // Fragen mit Standard-Status anreichern falls nicht vorhanden
  const enhancedQuestions = questions.map((q) => ({
    ...q,
    status: q.status || ("neu" as const),
  }));

  // Filterung nach Tabs
  const filteredQuestions = enhancedQuestions.filter((q) => {
    if (activeTab === "Neu") return q.status === "neu";
    if (activeTab === "Gefragt") return q.status === "gefragt";
    if (activeTab === "Beantwortet") return q.status === "beantwortet";
    return true; // "Alle"
  });

  const allSelected = filteredQuestions.length > 0 && filteredQuestions.every((q) => selectedIds.includes(q.id));

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedIds(selectedIds.filter((id) => !filteredQuestions.some((q) => q.id === id)));
    } else {
      const newIds = Array.from(new Set([...selectedIds, ...filteredQuestions.map((q) => q.id)]));
      setSelectedIds(newIds);
    }
  };

  const toggleSelectOne = (id: number) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((i) => i !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  // Massenaktion: Status auf "beantwortet" setzen (inkl. Backend-Sync)
  const handleBatchMarkAsAnswered = async () => {
    try {
      await Promise.all(
        selectedIds.map((id) => updateQuestionStatus(id, "beantwortet"))
      );

      const updated = enhancedQuestions.map((q) =>
        selectedIds.includes(q.id) ? { ...q, status: "beantwortet" as const } : q
      );
      onUpdateQuestions(updated);
      setSelectedIds([]);
    } catch (error) {
      console.error("Fehler beim Aktualisieren der Fragen im Backend:", error);
    }
  };

  // Massenaktion: Löschen
  const handleBatchDelete = async () => {
    try {
      const updated = enhancedQuestions.filter((q) => !selectedIds.includes(q.id));
      onUpdateQuestions(updated);
      setSelectedIds([]);
    } catch (error) {
      console.error("Fehler beim Löschen:", error);
    }
  };

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case "gefragt":
        return <span className="inline-block w-24 text-center rounded-full bg-pink-100 px-3 py-1 text-xs font-semibold text-pink-600">gefragt</span>;
      case "beantwortet":
        return <span className="inline-block w-24 text-center rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">beantwortet</span>;
      default:
        return <span className="inline-block w-24 text-center rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">neu</span>;
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-5xl rounded-3xl bg-white p-6 shadow-2xl max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header & Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-gray-100">
          <div className="flex items-center gap-2">
            {(["Alle", "Neu", "Gefragt", "Beantwortet"] as FilterTab[]).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                  activeTab === tab
                    ? "bg-pink-600 text-white shadow-sm"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <button
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Bulk Actions Banner (erscheint wenn Fragen ausgewählt sind) */}
        {selectedIds.length > 0 && (
          <div className="my-4 flex items-center justify-between rounded-2xl bg-pink-50 px-5 py-3 border border-pink-100 animate-fade-in">
            <span className="text-sm font-bold text-pink-700">
              {selectedIds.length} {selectedIds.length === 1 ? "Frage ausgewählt" : "Fragen ausgewählt"}
            </span>
            <div className="flex items-center gap-3">
              <button
                onClick={handleBatchMarkAsAnswered}
                className="flex items-center gap-1.5 rounded-xl bg-white px-4 py-2 text-xs font-semibold text-gray-700 shadow-sm border border-gray-200 hover:bg-gray-50 transition-colors"
              >
                <Check className="h-3.5 w-3.5 text-emerald-600" />
                Als beantwortet markieren
              </button>
              <button
                onClick={handleBatchDelete}
                className="flex items-center gap-1.5 rounded-xl bg-white px-4 py-2 text-xs font-semibold text-rose-600 shadow-sm border border-rose-200 hover:bg-rose-50 transition-colors"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Löschen
              </button>
            </div>
          </div>
        )}

        {/* Tabellenansicht */}
        <div className="flex-1 overflow-y-auto mt-2">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-gray-100 text-xs font-semibold uppercase tracking-wider text-gray-400">
                <th className="py-3 pl-4 pr-2 w-12">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={toggleSelectAll}
                    className="h-4 w-4 rounded border-gray-300 text-pink-600 focus:ring-pink-500 cursor-pointer"
                  />
                </th>
                <th className="py-3 px-2">Frage</th>
                <th className="py-3 px-2">Folie · Thema</th>
                <th className="py-3 px-2 text-center">Votes</th>
                <th className="py-3 px-2">Status</th>
                <th className="py-3 pr-4 pl-2 text-right">Aktionen</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-sm">
              {filteredQuestions.map((q) => {
                const isSelected = selectedIds.includes(q.id);
                const isAnswered = q.status === "beantwortet";

                return (
                  <tr key={q.id} className={`hover:bg-gray-50/80 transition-colors ${isSelected ? "bg-pink-50/40" : ""}`}>
                    <td className="py-4 pl-4 pr-2">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelectOne(q.id)}
                        className="h-4 w-4 rounded border-gray-300 text-pink-600 focus:ring-pink-500 cursor-pointer"
                      />
                    </td>
                    <td className="py-4 px-2 font-medium text-gray-900 max-w-md truncate">
                      {q.text}
                    </td>
                    <td className="py-4 px-2">
                      <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-600">
                        {q.slideNumber ? `Folie ${q.slideNumber} · ` : ""}
                        {q.topic || "Allgemein"}
                      </span>
                    </td>
                    <td className="py-4 px-2 text-center font-bold text-gray-800">
                      {q.votes}
                    </td>
                    <td className="py-4 px-2">
                      {getStatusBadge(q.status)}
                    </td>
                    <td className="py-4 pr-4 pl-2 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={async () => {
                            const nextStatus = isAnswered ? "gefragt" : "beantwortet";
                            try {
                              await updateQuestionStatus(q.id, nextStatus);
                              const updated = enhancedQuestions.map((item) =>
                                item.id === q.id ? { ...item, status: nextStatus as any } : item
                              );
                              onUpdateQuestions(updated);
                            } catch (err) {
                              console.error("Fehler beim Statuswechsel:", err);
                            }
                          }}
                          className={`w-32 flex items-center justify-between px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all shadow-2xs ${
                            isAnswered 
                              ? "bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100" 
                              : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
                          }`}
                          title={isAnswered ? "Als nicht erledigt markieren" : "Als erledigt markieren"}
                        >
                          <span>Erledigt</span>
                          <Check className={`h-4 w-4 ${isAnswered ? "text-emerald-600" : "text-gray-400"}`} />
                        </button>

                        <button
                          onClick={() => {
                            const updated = enhancedQuestions.filter((item) => item.id !== q.id);
                            onUpdateQuestions(updated);
                          }}
                          className="flex h-8 w-8 items-center justify-center rounded-xl border border-rose-100 text-rose-500 hover:bg-rose-50 transition-colors"
                          title="Löschen"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filteredQuestions.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-sm text-gray-400">
                    Keine Fragen in dieser Ansicht vorhanden.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
}