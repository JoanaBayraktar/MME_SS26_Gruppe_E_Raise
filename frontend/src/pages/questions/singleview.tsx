import React, { useState, useEffect, useRef } from "react";
import { X, ArrowUp, Send, Loader2, ChevronDown } from "lucide-react";
import { fetchComments, sendComment, voteComment } from "../questions/questionsService";

interface Comment {
  id: number;
  frageId: number;
  author?: string;
  isMe?: boolean;
  isDozent?: boolean;
  time: string;
  text: string;
  votes: number;
  voted: boolean;
  erstelltAm?: string;
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
}

interface SingleViewProps {
  question: Question;
  onClose: () => void;
}

type SortOption = "votes" | "newest";

export function SingleView({ question, onClose }: SingleViewProps) {
  const [startY, setStartY] = useState<number | null>(null);
  const [currentY, setCurrentY] = useState(0);
  const [isClosing, setIsClosing] = useState(false);
  const sheetRef = useRef<HTMLDivElement>(null);

  // States für Kommentare, Ladezustand, Sortierung und Eingabe
  const [commentsList, setCommentsList] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newCommentText, setNewCommentText] = useState("");
  const [sortOrder, setSortOrder] = useState<SortOption>("votes");
  const [isSortDropdownOpen, setIsSortDropdownOpen] = useState(false);

  // Kommentare beim Öffnen der Ansicht aus dem Backend laden
  useEffect(() => {
    let isMounted = true;
    async function loadCommentsData() {
      try {
        setIsLoading(true);
        const data = await fetchComments(question.id);
        if (isMounted) {
          setCommentsList(data || []);
        }
      } catch (error) {
        console.error("Fehler beim Laden der Kommentare:", error);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }
    loadCommentsData();
    return () => {
      isMounted = false;
    };
  }, [question.id]);

  // Touch-Events zum Herunterswipen (Schließen)
  const handleTouchStart = (e: React.TouchEvent) => {
    setStartY(e.touches[0].clientY);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (startY === null) return;
    const deltaY = e.touches[0].clientY - startY;
    if (deltaY > 0) {
      setCurrentY(deltaY);
    }
  };

  const handleTouchEnd = () => {
    if (currentY > 120) {
      triggerClose();
    } else {
      setCurrentY(0);
    }
    setStartY(null);
  };

  const triggerClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
    }, 250);
  };

  // Kommentar über den Service an das Backend senden
  const handleAddComment = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newCommentText.trim() || isSubmitting) return;

    try {
      setIsSubmitting(true);
      const savedComment = await sendComment(question.id, newCommentText.trim());
      
      if (savedComment) {
        setCommentsList((prev) => [...prev, savedComment]);
      } else {
        const updatedComments = await fetchComments(question.id);
        setCommentsList(updatedComments);
      }

      setNewCommentText("");
    } catch (error) {
      console.error("Fehler beim Speichern des Kommentars:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Vote für einen Kommentar umschalten
  const handleVoteComment = async (id: number) => {
    setCommentsList((prev) =>
      prev.map((c) => {
        if (c.id === id) {
          const newVoted = !c.voted;
          return {
            ...c,
            voted: newVoted,
            votes: newVoted ? c.votes + 1 : c.votes - 1,
          };
        }
        return c;
      })
    );

    try {
      await voteComment(id);
    } catch (error) {
      console.error("Fehler beim Voten des Kommentars:", error);
    }
  };

  // Kommentare dynamisch basierend auf der Auswahl sortieren
  const sortedComments = [...commentsList].sort((a, b) => {
    if (sortOrder === "votes") {
      if (b.votes !== a.votes) {
        return b.votes - a.votes;
      }
      // Fallback bei gleichen Votes: Neueste zuerst
      return new Date(b.erstelltAm || 0).getTime() - new Date(a.erstelltAm || 0).getTime();
    } else {
      // "newest"
      return new Date(b.erstelltAm || 0).getTime() - new Date(a.erstelltAm || 0).getTime();
    }
  });

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      {/* Hintergrund-Tint mit Fade-In */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-xs transition-opacity duration-300"
        onClick={triggerClose}
      />

      {/* Das eigentliche Bottom-Sheet, 80% Höhe */}
      <div
        ref={sheetRef}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{
          transform: `translateY(${currentY}px)`,
          transition: startY ? "none" : "transform 0.25s ease-out",
        }}
        className={`relative w-full max-w-3xl h-[80vh] bg-white rounded-t-[2.5rem] shadow-2xl flex flex-col z-10 overflow-hidden transition-transform ${
          isClosing ? "translate-y-full" : "animate-in slide-in-from-bottom duration-300"
        }`}
      >
        {/* Swipe-Indicator oben */}
        <div className="w-full flex justify-center pt-3 pb-1 cursor-grab active:cursor-grabbing">
          <div className="w-12 h-1.5 bg-gray-300 rounded-full" />
        </div>

        {/* Header: "Kommentare" links, Sortier-Dropdown & X-Button rechts */}
        <div className="flex items-center justify-between px-6 py-3 border-b border-gray-100">
          <div className="flex items-baseline gap-2">
            <h2 className="text-xl font-bold text-gray-900">Kommentare</h2>
            <span className="text-lg font-semibold text-gray-400">{commentsList.length}</span>
          </div>
          <div className="flex items-center gap-4 relative">
            {/* Sortier-Button mit Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsSortDropdownOpen(!isSortDropdownOpen)}
                className="flex items-center gap-1 text-sm font-medium text-pink-600 hover:text-pink-700 transition-colors focus:outline-none"
              >
                <span>{sortOrder === "votes" ? "Nach Votes" : "Neueste"}</span>
                <ChevronDown className={`h-4 w-4 transition-transform ${isSortDropdownOpen ? "rotate-180" : ""}`} />
              </button>

              {isSortDropdownOpen && (
                <div className="absolute right-0 mt-2 w-36 bg-white border border-gray-100 rounded-xl shadow-lg py-1 z-20">
                  <button
                    type="button"
                    onClick={() => {
                      setSortOrder("votes");
                      setIsSortDropdownOpen(false);
                    }}
                    className={`w-full text-left px-4 py-2 text-xs font-medium hover:bg-gray-50 ${
                      sortOrder === "votes" ? "text-pink-600 font-semibold bg-pink-50/50" : "text-gray-700"
                    }`}
                  >
                    Nach Votes
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSortOrder("newest");
                      setIsSortDropdownOpen(false);
                    }}
                    className={`w-full text-left px-4 py-2 text-xs font-medium hover:bg-gray-50 ${
                      sortOrder === "newest" ? "text-pink-600 font-semibold bg-pink-50/50" : "text-gray-700"
                    }`}
                  >
                    Neueste
                  </button>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={triggerClose}
              className="p-2 rounded-full hover:bg-gray-100 text-gray-500 transition-colors"
              aria-label="Schließen"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Scrollbarer Inhalt */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
          
          {/* Die ausgewählte Frage im angepassten Layout */}
          <div className="bg-gray-50/80 border border-gray-100 rounded-2xl p-4 shadow-xs">
            <div className="mb-1 flex items-center gap-2 text-xs text-gray-500">
              <span className="font-semibold text-gray-800">{question.author}</span>
              <span>•</span>
              <span>{question.time}</span>
            </div>
            <p className="mb-3 text-sm font-semibold leading-relaxed text-gray-900">
              {question.text}
            </p>
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="rounded-full bg-pink-100 px-3 py-1 font-medium text-pink-700">
                gefragt
              </span>
              {(question.tag || question.topic) && (
                <span className="rounded-full bg-white border border-gray-200 px-3 py-1 font-medium text-gray-700 shadow-2xs">
                  {question.tag || `Thema: ${question.topic}`}
                </span>
              )}
            </div>
          </div>

          {/* Ladezustand oder Kommentarliste */}
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-pink-600" />
            </div>
          ) : commentsList.length === 0 ? (
            <div className="text-center py-10 text-gray-400 text-sm">
              Bisher noch keine Kommentare. Schreibe als Erste/r einen Kommentar!
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {sortedComments.map((comment) => (
                <div key={comment.id} className="py-4 first:pt-0 last:pb-0">
                  <div className="flex items-start justify-between gap-4">
                    
                    {/* Linker Bereich: Autor, Dozenten-/du-Badge, Uhrzeit & Text */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-semibold text-gray-700">
                          {comment.author || (comment.isDozent ? "Dozent" : "Anonymer Nutzer")}
                        </span>
                        {comment.isMe && (
                          <span className="bg-pink-100 text-pink-600 text-[10px] font-bold px-1.5 py-0.5 rounded">
                            du
                          </span>
                        )}
                        {comment.isDozent && (
                          <span className="bg-purple-100 text-purple-700 text-[10px] font-bold px-1.5 py-0.5 rounded">
                            Dozent
                          </span>
                        )}
                        <span className="text-xs text-gray-400">
                          {comment.time}
                        </span>
                      </div>
                      <p className="text-sm text-gray-900 leading-snug">
                        {comment.text}
                      </p>
                    </div>

                    {/* Rechter Bereich: Vote-Anzahl und Button entsprechend der Design-Vorlage */}
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-sm font-semibold text-gray-900">
                        {comment.votes ?? 0}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleVoteComment(comment.id)}
                        className={`p-2 rounded-full border transition-all flex items-center justify-center ${
                          comment.voted
                            ? "bg-pink-600 border-pink-600 text-white shadow-xs"
                            : "bg-white border-gray-200 text-gray-700 hover:border-gray-300"
                        }`}
                        aria-label="Upvote"
                      >
                        <ArrowUp className="h-4 w-4" />
                      </button>
                    </div>

                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Fixiertes Eingabefeld unten */}
        <div className="p-4 bg-white border-t border-gray-100">
          <form onSubmit={handleAddComment} className="flex items-center gap-3">
            <input
              type="text"
              value={newCommentText}
              onChange={(e) => setNewCommentText(e.target.value)}
              placeholder="Kommentar schreiben ..."
              disabled={isSubmitting}
              className="flex-1 bg-white border border-gray-200 rounded-full px-5 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500 transition-all shadow-2xs disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={!newCommentText.trim() || isSubmitting}
              className="p-3 rounded-full bg-pink-600 text-white hover:bg-pink-700 disabled:opacity-50 transition-colors shadow-sm shrink-0 flex items-center justify-center"
              aria-label="Kommentar senden"
            >
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4 rotate-45 -translate-x-0.5" />
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}