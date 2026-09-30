import { useState, useMemo, useEffect } from "react";
import { SlidersHorizontal, ArrowUpDown, Calendar, BookOpen, ChevronRight, X, Search, Filter } from "lucide-react";
// Import your actual fetch function returning ArchivedEntryDto[]
import { fetchArchivedEntries, ArchivedEntryDto } from "./archivService";

interface ArchivProps {
  onSelectVeranstaltung?: (veranstaltungId: number) => void;
}

export default function Archiv({ onSelectVeranstaltung }: ArchivProps) {
  const [entries, setEntries] = useState<ArchivedEntryDto[]>([]);
  const [loading, setLoading] = useState(true);

  // States for top filters and sorting
  const [selectedKapitel, setSelectedKapitel] = useState<string>("all");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [showSortDropdown, setShowSortDropdown] = useState(false);

  // States for the bottom search bar & topic filter
  const [searchQueryInput, setSearchQueryInput] = useState<string>("");
  const [searchTopicInput, setSearchTopicInput] = useState<string>("");
  const [appliedSearchQuery, setAppliedSearchQuery] = useState<string>("");
  const [appliedSearchTopic, setAppliedSearchTopic] = useState<string>("");

  useEffect(() => {
    let isMounted = true;
    fetchArchivedEntries().then((data) => {
      if (isMounted) {
        setEntries(data);
        setLoading(false);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  // Dynamically extract unique chapters (kapitel) from the archive entries
  const chapters = useMemo(() => {
    const cats = new Set<string>();
    entries.forEach((e) => {
      if (e.kapitel) {
        cats.add(e.kapitel.trim());
      }
    });
    return Array.from(cats);
  }, [entries]);

  // Filter and chronologically sort entries
  const filteredAndSortedEntries = useMemo(() => {
    let result = [...entries];

    // Filter by top chapter filter if selected
    if (selectedKapitel !== "all") {
      result = result.filter((e) => e.kapitel?.toLowerCase() === selectedKapitel.toLowerCase());
    }

    // Filter by bottom search topic dropdown if selected
    if (searchTopicInput) {
      result = result.filter((e) => e.kapitel?.toLowerCase() === searchTopicInput.toLowerCase());
    }

    // Filter by applied search query (Fragetexte, Kommentare/Antworten, Themen-Tags)
    if (appliedSearchQuery.trim()) {
      const query = appliedSearchQuery.toLowerCase().trim();
      result = result.filter((e) => {
        const matchFrage = e.frageText?.toLowerCase().includes(query);
        const matchAntwort = e.antwortText?.toLowerCase().includes(query);
        const matchKapitel = e.kapitel?.toLowerCase().includes(query);
        
        // Safety check if a separate tags array exists on the DTO
        const matchTags = Array.isArray((e as any).tags)
          ? (e as any).tags.some((tag: string) => tag.toLowerCase().includes(query))
          : false;

        return matchFrage || matchAntwort || matchKapitel || matchTags;
      });
    }

    // Chronological sorting based on 'erstelltAm'
    result.sort((a, b) => {
      const dateA = new Date(a.erstelltAm).getTime();
      const dateB = new Date(b.erstelltAm).getTime();

      if (sortOrder === "desc") {
        return dateB - dateA; // Neueste zuerst (Absteigend)
      } else {
        return dateA - dateB; // Älteste zuerst (Aufsteigend)
      }
    });

    return result;
  }, [entries, selectedKapitel, searchTopicInput, appliedSearchQuery, sortOrder]);

  const handleCardClick = (veranstaltungId: number) => {
    if (onSelectVeranstaltung) {
      onSelectVeranstaltung(veranstaltungId);
    }
  };

  const handleSearchClick = () => {
    setAppliedSearchQuery(searchQueryInput);
    setAppliedSearchTopic(searchTopicInput);
  };

  const handleClearSearch = () => {
    setSearchQueryInput("");
    setSearchTopicInput("");
    setAppliedSearchQuery("");
    setAppliedSearchTopic("");
  };

  return (
    <div className="space-y-4 animate-fade-in motion-reduce:animate-none relative">
      {/* Filter and Sort Bar */}
      <div className="flex items-center justify-between gap-2">
        <div className="relative">
          <button
            type="button"
            onClick={() => {
              setShowFilterDropdown(!showFilterDropdown);
              setShowSortDropdown(false);
            }}
            className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-2xs hover:bg-gray-50 cursor-pointer"
          >
            <span>{selectedKapitel === "all" ? "Kapitel Filter" : `Kapitel: ${selectedKapitel}`}</span>
            <SlidersHorizontal className="h-3.5 w-3.5 text-gray-400" />
          </button>

          {/* Filter Dropdown */}
          {showFilterDropdown && (
            <div className="absolute left-0 mt-2 w-48 rounded-2xl border border-gray-100 bg-white p-2 shadow-lg z-20">
              <button
                type="button"
                onClick={() => {
                  setSelectedKapitel("all");
                  setShowFilterDropdown(false);
                }}
                className={`w-full text-left px-3 py-2 text-xs font-medium rounded-xl transition-colors ${
                  selectedKapitel === "all" ? "bg-pink-50 text-pink-600 font-semibold" : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                Alle Kapitel
              </button>
              {chapters.map((kap) => (
                <button
                  key={kap}
                  type="button"
                  onClick={() => {
                    setSelectedKapitel(kap);
                    setShowFilterDropdown(false);
                  }}
                  className={`w-full text-left px-3 py-2 text-xs font-medium rounded-xl transition-colors truncate ${
                    selectedKapitel === kap ? "bg-pink-50 text-pink-600 font-semibold" : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  {kap}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="relative">
          <button
            type="button"
            onClick={() => {
              setShowSortDropdown(!showSortDropdown);
              setShowFilterDropdown(false);
            }}
            className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-2xs hover:bg-gray-50 cursor-pointer"
          >
            <span>Sortieren nach</span>
            <ArrowUpDown className="h-3.5 w-3.5 text-gray-400" />
          </button>

          {/* Sort Dropdown */}
          {showSortDropdown && (
            <div className="absolute right-0 mt-2 w-48 rounded-2xl border border-gray-100 bg-white p-2 shadow-lg z-20">
              <button
                type="button"
                onClick={() => {
                  setSortOrder("desc");
                  setShowSortDropdown(false);
                }}
                className={`w-full text-left px-3 py-2 text-xs font-medium rounded-xl transition-colors ${
                  sortOrder === "desc" ? "bg-pink-50 text-pink-600 font-semibold" : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                Neueste zuerst
              </button>
              <button
                type="button"
                onClick={() => {
                  setSortOrder("asc");
                  setShowSortDropdown(false);
                }}
                className={`w-full text-left px-3 py-2 text-xs font-medium rounded-xl transition-colors ${
                  sortOrder === "asc" ? "bg-pink-50 text-pink-600 font-semibold" : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                Älteste zuerst
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Active Filter Indicator */}
      {selectedKapitel !== "all" && (
        <div className="flex items-center gap-2 px-1">
          <span className="inline-flex items-center gap-1 text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
            Kapitel: {selectedKapitel}
            <button 
              onClick={() => setSelectedKapitel("all")} 
              className="hover:text-gray-800 cursor-pointer ml-1"
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        </div>
      )}

      {/* Archived Entries List */}
      {loading ? (
        <p className="rounded-2xl border border-dashed border-gray-200 bg-white px-4 py-8 text-center text-sm text-gray-500 animate-pulse">
          Lade Archiv...
        </p>
      ) : filteredAndSortedEntries.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-gray-200 bg-white px-4 py-8 text-center text-sm text-gray-500">
          Keine archivierten Einträge gefunden.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-3">
          {filteredAndSortedEntries.map((entry) => (
            <div
              key={entry.id}
              onClick={() => handleCardClick(entry.veranstaltungId)}
              className="flex flex-col gap-3 rounded-2xl border border-gray-100 bg-white p-5 shadow-xs hover:border-pink-200 hover:shadow-md transition-all cursor-pointer group"
            >
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <span className="text-xs font-semibold text-pink-600 uppercase tracking-wider">
                    {entry.veranstaltungName} {entry.folienNr ? `• Folie ${entry.folienNr}` : ""}
                  </span>
                  <h3 className="text-base font-semibold text-gray-900 group-hover:text-pink-600 transition-colors">
                    {entry.frageText}
                  </h3>
                </div>
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-50 text-gray-400 group-hover:bg-pink-50 group-hover:text-pink-600 transition-colors">
                  <ChevronRight className="h-4 w-4" />
                </div>
              </div>

              {entry.antwortText && (
                <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-xl border border-gray-100">
                  <strong className="text-gray-900">Antwort:</strong> {entry.antwortText}
                </p>
              )}

              <div className="flex items-center gap-2 pt-1">
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

      {/* Integrated Search and Topic Filter Bar at the Bottom */}
      <div className="mt-8 bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
        <div className="flex flex-col md:flex-row gap-3 items-center">
          
          {/* Suchleiste mit Eingabefeld */}
          <div className="relative flex-1 w-full">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={searchQueryInput}
              onChange={(e) => setSearchQueryInput(e.target.value)}
              placeholder="Fragetexte, Kommentare oder Tags durchsuchen..."
              className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 transition-all"
            />
            {searchQueryInput && (
              <button
                onClick={() => setSearchQueryInput("")}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Themen-Auswahl (Dropdown) */}
          <div className="relative w-full md:w-64">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Filter className="w-4 h-4" />
            </div>
            <select
              value={searchTopicInput}
              onChange={(e) => setSearchTopicInput(e.target.value)}
              className="w-full pl-9 pr-8 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 appearance-none transition-all cursor-pointer"
            >
              <option value="">Alle Themen</option>
              {chapters.map((kap) => (
                <option key={kap} value={kap}>
                  {kap}
                </option>
              ))}
            </select>
            {/* Dropdown Arrow */}
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>

          {/* Expliziter "Suchen"-Button */}
          <div className="flex items-center gap-2 w-full md:w-auto">
            <button
              type="button"
              onClick={handleSearchClick}
              className="flex-1 md:flex-none px-5 py-2.5 bg-pink-600 hover:bg-pink-700 active:bg-pink-800 text-white font-medium text-sm rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <Search className="w-4 h-4" />
              <span>Suchen</span>
            </button>

            {(appliedSearchQuery || appliedSearchTopic || searchQueryInput || searchTopicInput) && (
              <button
                type="button"
                onClick={handleClearSearch}
                className="px-3 py-2.5 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-xl text-sm transition-colors cursor-pointer"
                title="Filter zurücksetzen"
              >
                Zurücksetzen
              </button>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}