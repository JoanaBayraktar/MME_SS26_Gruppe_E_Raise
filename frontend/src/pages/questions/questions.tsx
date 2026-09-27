import { FormEvent, useEffect, useRef, useState } from "react";
import { MessageSquare, Send, ArrowUp, ChevronUp, ChevronDown } from "lucide-react";
// Import aus deiner neuen Service-Datei (Pfade anpassen, je nachdem wo der services-Ordner liegt)
import { fetchQuestions, sendQuestion } from "../questions/questionsService";

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
  
  const slideBoxRef = useRef<HTMLDivElement>(null);
  const topicBoxRef = useRef<HTMLDivElement>(null);

  // Dropdown außerhalb schließen
  useEffect(() => {
    const closeOnOutsideClick = (event: PointerEvent) => {
      const target = event.target as Node;
      if (!slideBoxRef.current?.contains(target)) setIsSlideOpen(false);
      if (!topicBoxRef.current?.contains(target)) setIsTopicOpen(false);
    };
    document.addEventListener("pointerdown", closeOnOutsideClick);
    return () => document.removeEventListener("pointerdown", closeOnOutsideClick);
  }, []);

  // 1. DATEN BEIM LADEN ABRUFEN (Nutzt den Service)
  useEffect(() => {
    fetchQuestions()
      .then((data) => setQuestions(data))
      .catch((err) => console.error("Fehler beim Laden:", err));
  }, []);

  // 2. FRAGE ABSENDEN (Nutzt den Service)
  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const text = newQuestionText.trim();
    if (!text) return;

    try {
      const savedQuestion = await sendQuestion({
        text,
        author: "Du (Teilnehmer)",
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

  // Upvote-Logik (bleibt vorerst lokal im State)
  const handleVote = (questionId: number) => {
    setQuestions((current) =>
      current.map((q) =>
        q.id === questionId ? { ...q, votes: q.voted ? q.votes - 1 : q.votes + 1, voted: !q.voted } : q
      )
    );
  };

  const professorTopics = ["Einführung & Grundlagen", "Methodik & Analyse", "Ergebnisse der Studie", "Diskussion & Ausblick"];

  return (
    <div className="flex flex-col min-h-[calc(100vh-7rem)] pb-24 animate-fade-in motion-reduce:animate-none">
      {/* Fragen-Liste */}
      <div className="flex-1 space-y-4 mb-6">
        {questions.map((question) => (
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
                className={`flex h-8 w-8 items-center justify-center rounded-full transition-colors ${
                  question.voted ? "bg-pink-600 text-white" : "text-gray-500 hover:bg-pink-50 hover:text-pink-600"
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
                onClick={() => { setIsSlideOpen(!isSlideOpen); setIsTopicOpen(false); }}
                className={`flex items-center gap-1 px-3 py-1 text-xs font-medium shadow-sm transition-all ${
                  isSlideOpen || slideNumber ? "rounded-t-lg rounded-b-none bg-pink-600 text-white" : "rounded-t-lg rounded-b-none bg-gray-100 text-gray-700"
                }`}
              >
                <span>{slideNumber ? `Folie ${slideNumber}` : "Folie"}</span>
                {isSlideOpen ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
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
                onClick={() => { setIsTopicOpen(!isTopicOpen); setIsSlideOpen(false); }}
                className={`flex items-center gap-1 px-3 py-1 text-xs font-medium shadow-sm transition-all ${
                  isTopicOpen || selectedTopic ? "rounded-t-lg rounded-b-none bg-pink-600 text-white" : "rounded-t-lg rounded-b-none bg-gray-100 text-gray-700"
                }`}
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