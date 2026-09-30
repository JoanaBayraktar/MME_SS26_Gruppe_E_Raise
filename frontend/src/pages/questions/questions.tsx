import { FormEvent, useEffect, useRef, useState } from "react";
import { MessageSquare, Send, ArrowUp, ChevronUp, ChevronDown, ArrowUpDown } from "lucide-react";
// Import aus deiner Service-Datei (inklusive voteQuestion)
import { fetchQuestions, sendQuestion, determineAuthorName, voteQuestion } from "../questions/questionsService";

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

export default function Questions() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [newQuestionText, setNewQuestionText] = useState("");
  
  const [isSlideOpen, setIsSlideOpen] = useState(false);
  const [slideNumber, setSlideNumber] = useState("");
  const [isTopicOpen, setIsTopicOpen] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState("");

  // State für die Sortierung ("newest" oder "votes") und das Dropdown
  const [sortBy, setSortBy] = useState<"newest" | "votes">("newest");
  const [isSortOpen, setIsSortOpen] = useState(false);
  
  const slideBoxRef = useRef<HTMLDivElement>(null);
  const topicBoxRef = useRef<HTMLDivElement>(null);
  const sortBoxRef = useRef<HTMLDivElement>(null);

  // Dropdown außerhalb schließen
  useEffect(() => {
    const closeOnOutsideClick = (event: PointerEvent) => {
      const target = event.target as Node;
      if (!slideBoxRef.current?.contains(target)) setIsSlideOpen(false);
      if (!topicBoxRef.current?.contains(target)) setIsTopicOpen(false);
      if (!sortBoxRef.current?.contains(target)) setIsSortOpen(false);
    };
    document.addEventListener("pointerdown", closeOnOutsideClick);
    return () => document.removeEventListener("pointerdown", closeOnOutsideClick);
  }, []);

  // Daten abrufen (nutzt automatisch die aktive Session oder den #0000 Fallback)
  useEffect(() => {
    fetchQuestions()
      .then((data) => setQuestions(data))
      .catch((err) => console.error("Fehler beim Laden:", err));
  }, []);

  // Frage absenden
  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const text = newQuestionText.trim();
    if (!text) return;

    try {
      // Autor über separate Methode ermitteln (berücksichtigt Anonym-Status)
      const authorName = await determineAuthorName();

      const savedQuestion = await sendQuestion({
        text,
        author: authorName,
        slideNumber: slideNumber ? Number(slideNumber) : undefined,
        topic: selectedTopic || "Allgemein",
      });

      // UI aktualisieren mit der Antwort aus dem Backend (inkl. echter DB-ID)
      setQuestions((current) => [savedQuestion, ...current]);
      
      // Formular zurücksetzen
      setNewQuestionText("");
      setSlideNumber("");
      setSelectedTopic("");
      setIsSlideOpen(false);
      setIsTopicOpen(false);
    } catch (error) {
      console.error("Fehler beim Absenden:", error);
    }
  };

  // Vote-Handler mit Optimistic Updates und automatischem Rollback
  const handleVote = async (questionId: number) => {
    const targetQuestion = questions.find((q) => q.id === questionId);
    if (!targetQuestion) return;

    const newVotedState = !targetQuestion.voted;

    // 1. UI sofort aktualisieren (Optimistic Update)
    setQuestions((current) =>
      current.map((question) =>
        question.id === questionId
          ? {
              ...question,
              votes: newVotedState ? question.votes + 1 : question.votes - 1,
              voted: newVotedState,
            }
          : question,
      ),
    );

    // 2. Backend-Service aufrufen
    try {
      const updatedQuestion = await voteQuestion(questionId);

      // Falls das Backend die genaue Antwort zurückliefert, synchronisieren
      if (updatedQuestion && typeof updatedQuestion.votes === "number") {
        setQuestions((current) =>
          current.map((question) =>
            question.id === questionId
              ? { ...question, votes: updatedQuestion.votes, voted: updatedQuestion.voted }
              : question,
          ),
        );
      }
    } catch (error) {
      console.error("Fehler beim Voten im Backend:", error);

      // 3. Bei Fehler Änderungen im UI rückgängig machen (Rollback)
      setQuestions((current) =>
        current.map((question) =>
          question.id === questionId
            ? {
                ...question,
                votes: targetQuestion.votes,
                voted: targetQuestion.voted,
              }
            : question,
        ),
      );

      alert("Dein Vote konnte nicht gespeichert werden.");
    }
  };

  // Sortierte Fragen basierend auf der Auswahl berechnen
  const sortedQuestions = [...questions].sort((a, b) => {
    if (sortBy === "votes") {
      if (b.votes !== a.votes) {
        return b.votes - a.votes; // Höchste Votes zuerst
      }
    }
    // Standard / "newest": Höhere ID = neuer erstellt
    return b.id - a.id;
  });

  const professorTopics = ["Einführung & Grundlagen", "Methodik & Analyse", "Ergebnisse der Studie", "Diskussion & Ausblick"];

  return (
    <div className="flex flex-col min-h-[calc(100vh-7rem)] pb-24 animate-fade-in motion-reduce:animate-none">
      
      {/* Sortier-Leiste oben */}
      <div className="flex items-center justify-between mb-4 px-1">
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
          {sortedQuestions.length} {sortedQuestions.length === 1 ? "Frage" : "Fragen"}
        </span>
        
        <div className="relative" ref={sortBoxRef}>
          <button
            type="button"
            onClick={() => { setIsSortOpen(!isSortOpen); setIsSlideOpen(false); setIsTopicOpen(false); }}
            className="flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 shadow-sm transition-all hover:bg-gray-50"
          >
            <ArrowUpDown className="h-3.5 w-3.5 text-pink-600" />
            <span>{sortBy === "newest" ? "Neueste" : "Meiste Votes"}</span>
          </button>

          {isSortOpen && (
            <div className="absolute right-0 mt-2 w-44 origin-top-right rounded-xl border border-gray-100 bg-white p-1.5 shadow-xl z-25">
              <button
                type="button"
                onClick={() => { setSortBy("newest"); setIsSortOpen(false); }}
                className={`w-full rounded-lg px-3 py-2 text-left text-xs font-medium transition-colors ${
                  sortBy === "newest" ? "bg-pink-50 text-pink-600" : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                Neueste zuerst
              </button>
              <button
                type="button"
                onClick={() => { setSortBy("votes"); setIsSortOpen(false); }}
                className={`w-full rounded-lg px-3 py-2 text-left text-xs font-medium transition-colors ${
                  sortBy === "votes" ? "bg-pink-50 text-pink-600" : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                Meiste Votes zuerst
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Fragen-Liste */}
      <div className="flex-1 space-y-4 mb-6">
        {sortedQuestions.map((question) => (
          <div key={question.id} className="flex justify-between gap-3 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm transition-all hover:shadow-md">
            <div className="flex-1">
              <div className="mb-1 flex items-center gap-2 text-xs text-gray-500">
                <span className="font-semibold text-gray-800">{question.author}</span>
                <span>•</span>
                <span>{question.time}</span>
              </div>
              <p className="mb-3 text-sm font-medium leading-relaxed text-gray-900">{question.text}</p>
              <div className="flex flex-wrap items-center gap-2 text-xs">
                {question.tag && <span className="rounded-full bg-pink-50 px-2.5 py-0.5 font-medium text-pink-600 border border-pink-100">{question.tag}</span>}
                <span className="rounded-full border border-pink-100 bg-pink-50 px-2.5 py-0.5 font-medium text-pink-600">
                  Thema: {question.topic || "Allgemein"}
                </span>
                <span className="ml-auto flex items-center gap-1 text-gray-400">
                  <MessageSquare className="h-3.5 w-3.5" /> {question.comments}
                </span>
              </div>
            </div>

            <div className="flex flex-col items-center justify-center border-l border-gray-100 pl-3">
              <button 
              type="button"
              onClick={() => handleVote(question.id)}
              className={`flex h-8 w-8 items-center justify-center rounded-lg transition-colors ${
                question.voted 
                ? "bg-pink-600 text-white border border-pink-600" 
                : "bg-white border border-gray-200 text-gray-500 hover:bg-pink-50 hover:border-pink-300 hover:text-pink-600"
                
              }`}
  >
    <ArrowUp className="h-4 w-4" strokeWidth={2.5} />
  </button>
  <span className="text-xs font-bold text-gray-800">{question.votes}</span>
</div>
          </div>
        ))}
      </div>

      {/* Eingabefeld unten */}
      <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-t from-white via-white/90 to-transparent pt-8 pb-4 px-4 z-30">
        <div className="max-w-3xl mx-auto">
          <form onSubmit={handleSubmit} className="relative pt-6">
            <div ref={slideBoxRef} className="absolute left-4 top-0 z-20">
              <button
                type="button"
                onClick={() => { setIsSlideOpen(!isSlideOpen); setIsTopicOpen(false); setIsSortOpen(false); }}
                className={`flex items-center gap-1 px-3 py-1 text-xs font-medium shadow-sm transition-all 
                  ${isSlideOpen ? "w-40 justify-between rounded-b-lg rounded-t-none" : "rounded-t-lg rounded-b-none"} 
                  ${isSlideOpen || slideNumber ? "bg-pink-600 text-white" : "bg-gray-100 text-gray-700"}`}
              >
                <span>{slideNumber ? `Folie ${slideNumber}` : "Folie"}</span>
                {isSlideOpen ? <ChevronUp className="h-3 w-3 shrink-0" /> : <ChevronDown className="h-3 w-3" />}
              </button>
              {isSlideOpen && (
                <div className="absolute bottom-full left-0 w-40 origin-bottom-left rounded-t-xl rounded-b-none border border-pink-200 bg-pink-50 p-2.5 shadow-xl">
                  <input
                    type="number"
                    min="1"
                    placeholder="z. B. 12"
                    value={slideNumber}
                    onChange={(e) => setSlideNumber(e.target.value)}
                    className="w-full rounded-lg border border-pink-200 bg-white px-2.5 py-2 text-sm outline-none focus:border-pink-500"
                    autoFocus
                  />
                </div>
              )}
            </div>

            <div ref={topicBoxRef} className="absolute right-16 top-0 z-20">
              <button
                type="button"
                onClick={() => { setIsTopicOpen(!isTopicOpen); setIsSlideOpen(false); setIsSortOpen(false); }}
                className={`flex items-center gap-1 px-3 py-1 text-xs font-medium shadow-sm transition-all 
                  ${isTopicOpen ? "w-52 justify-between rounded-b-lg rounded-t-none" : "rounded-t-lg rounded-b-none"}
                  ${isTopicOpen || selectedTopic ? "bg-pink-600 text-white" : "bg-gray-100 text-gray-700"}`}
              >
                <span className="truncate">{selectedTopic || "Thema"}</span>
                {isTopicOpen ? <ChevronUp className="h-3 w-3 shrink-0" /> : <ChevronDown className="h-3 w-3 shrink-0" />}
              </button>
              {isTopicOpen && (
                <div className="absolute bottom-full right-0 w-52 origin-bottom-right rounded-t-xl rounded-b-none border border-pink-200 bg-pink-50 p-1.5 shadow-xl">
                  <button
                    type="button"
                    onClick={() => { setSelectedTopic(""); setIsTopicOpen(false); }}
                    className="w-full rounded-lg px-2 py-2 text-left text-xs bg-pink-50 text-gray-600 hover:bg-pink-100"
                  >
                    Kein Thema / Allgemein
                  </button>
                  {professorTopics.map((topic) => (
                    <button
                      key={topic}
                      type="button"
                      onClick={() => { setSelectedTopic(topic); setIsTopicOpen(false); }}
                      className="w-full truncate rounded-lg px-2 py-2 text-left text-xs font-medium bg-pink-50 text-gray-700 hover:bg-pink-100"
                    >
                      {topic}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="relative z-10 flex items-center gap-2">
              <div className="flex min-w-0 flex-1 items-center rounded-2xl border border-gray-200 bg-white p-2.5 shadow-lg shadow-gray-100">
                <input
                  type="text"
                  placeholder="Was würdest du gerne wissen?"
                  value={newQuestionText}
                  onChange={(e) => setNewQuestionText(e.target.value)}
                  className="flex-1 bg-transparent px-3 py-1 text-sm text-gray-800 outline-none placeholder:text-gray-400"
                />
              </div>
              <button type="submit" aria-label="Frage stellen" className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-pink-600 text-white shadow-sm hover:bg-pink-700">
                <Send className="h-4 w-4" />
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}