import { FormEvent, useEffect, useRef, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { MessageSquare, Send, ArrowUp, ChevronUp, ChevronDown } from "lucide-react";
import type { NavigationPageContext } from "../NavigationPage";

export default function Questions() {
  const { questions, newQuestionText, onQuestionTextChange, onAddQuestion, onVote } =
    useOutletContext<NavigationPageContext>();

  // Lokaler State für die aufklappbaren Elemente
  const [isSlideOpen, setIsSlideOpen] = useState(false);
  const [slideNumber, setSlideNumber] = useState("");
  const [isTopicOpen, setIsTopicOpen] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState("");
  const slideBoxRef = useRef<HTMLDivElement>(null);
  const topicBoxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const closeOnOutsideClick = (event: PointerEvent) => {
      const target = event.target as Node;
      if (!slideBoxRef.current?.contains(target)) setIsSlideOpen(false);
      if (!topicBoxRef.current?.contains(target)) setIsTopicOpen(false);
    };

    document.addEventListener("pointerdown", closeOnOutsideClick);
    return () => document.removeEventListener("pointerdown", closeOnOutsideClick);
  }, []);

  // Beispielhafte Themen vom Professor
  const professorTopics = [
    "Einführung & Grundlagen",
    "Methodik & Analyse",
    "Ergebnisse der Studie",
    "Diskussion & Ausblick"
  ];

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!newQuestionText.trim()) return;
    onAddQuestion({
      ...(slideNumber ? { slideNumber: Number(slideNumber) } : {}),
      ...(selectedTopic ? { topic: selectedTopic } : {}),
    });
    setSlideNumber("");
    setSelectedTopic("");
    setIsSlideOpen(false);
    setIsTopicOpen(false);
  };

  return (
    <div className="flex flex-col min-h-[calc(100vh-7rem)] pb-24 animate-fade-in motion-reduce:animate-none">
      {/* Fragen-Liste (wächst nach oben / scrollbar) */}
      <div className="flex-1 space-y-4 mb-6">
        {questions.map((question) => (
          <div
            key={question.id}
            className="flex justify-between gap-3 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm transition-all hover:shadow-md"
          >
            <div className="flex-1">
              <div className="mb-1 flex items-center gap-2 text-xs text-gray-500">
                <span className="font-semibold text-gray-800">{question.author}</span>
                <span>•</span>
                <span>{question.time}</span>
              </div>
              <p className="mb-3 text-sm font-medium leading-relaxed text-gray-900">
                {question.text}
              </p>
              <div className="flex flex-wrap items-center gap-2 text-xs">
                {question.tag && (
                  <span className="rounded-full bg-pink-50 px-2.5 py-0.5 font-medium text-pink-600 border border-pink-100">
                    {question.tag}
                  </span>
                )}
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
                aria-label={question.voted ? "Stimme zurücknehmen" : "Frage positiv bewerten"}
                aria-pressed={question.voted}
                onClick={() => onVote(question.id)}
                className={`flex h-8 w-8 items-center justify-center rounded-full transition-colors ${
                  question.voted
                    ? "bg-pink-600 text-white"
                    : "text-gray-500 hover:bg-pink-50 hover:text-pink-600"
                }`}
              >
                <ArrowUp className="h-4 w-4" strokeWidth={2.5} />
              </button>
              <span className="text-xs font-bold text-gray-800">{question.votes}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Unten fixiertes Eingabefeld mit cleanerem Design */}
      <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-t from-white via-white/90 to-transparent pt-8 pb-4 px-4 z-30">
        <div className="max-w-3xl mx-auto">
          <form
            onSubmit={handleSubmit}
            className="relative pt-6"
          >
            <div ref={slideBoxRef} className="absolute left-4 top-0 z-20">
                <button
                  type="button"
                  onClick={() => {
                    setIsSlideOpen(!isSlideOpen);
                    setIsTopicOpen(false);
                  }}
                  aria-expanded={isSlideOpen}
                  aria-controls="slide-selection"
                  className={`flex items-center gap-1 rounded-t-lg rounded-b-none px-3 py-1 text-xs font-medium shadow-sm transition-all ${
                    isSlideOpen
                      ? "w-40 justify-between bg-pink-600 text-white hover:bg-pink-700"
                      : slideNumber
                        ? "bg-pink-600 text-white hover:bg-pink-700"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  <span>{slideNumber ? `Folie ${slideNumber}` : "Folie"}</span>
                  {isSlideOpen ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                </button>
                {isSlideOpen && (
                  <div
                    id="slide-selection"
                    className="absolute bottom-full left-0 w-40 origin-bottom-left rounded-t-xl rounded-b-none border border-pink-200 bg-pink-50 p-2.5 shadow-xl ring-1 ring-black/5 animate-in fade-in slide-in-from-bottom-1"
                  >
                    <label htmlFor="question-slide" className="mb-1.5 block text-xs font-medium text-gray-600">
                      Foliennummer
                    </label>
                    <input
                      id="question-slide"
                      type="number"
                      min="1"
                      step="1"
                      placeholder="z. B. 12"
                      value={slideNumber}
                      onChange={(event) => setSlideNumber(event.target.value)}
                      className="w-full rounded-lg border border-pink-200 bg-white px-2.5 py-2 text-sm text-gray-800 outline-none focus:border-pink-500"
                      autoFocus
                    />
                  </div>
                )}
            </div>

            <div ref={topicBoxRef} className="absolute right-16 top-0 z-20">
                <button
                  type="button"
                  onClick={() => {
                    setIsTopicOpen(!isTopicOpen);
                    setIsSlideOpen(false);
                  }}
                  aria-expanded={isTopicOpen}
                  aria-controls="topic-selection"
                  className={`flex max-w-[160px] items-center gap-1 rounded-t-lg rounded-b-none px-3 py-1 text-xs font-medium shadow-sm transition-all ${
                    isTopicOpen
                      ? "w-52 max-w-none justify-between bg-pink-600 text-white hover:bg-pink-700"
                      : selectedTopic
                        ? "bg-pink-600 text-white hover:bg-pink-700"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  <span className="truncate">{selectedTopic || "Thema"}</span>
                  {isTopicOpen ? <ChevronUp className="h-3 w-3 shrink-0" /> : <ChevronDown className="h-3 w-3 shrink-0" />}
                </button>
                {isTopicOpen && (
                  <div
                    id="topic-selection"
                    className="absolute bottom-full right-0 w-52 origin-bottom-right rounded-t-xl rounded-b-none border border-pink-200 bg-pink-50 p-1.5 shadow-xl ring-1 ring-black/5 animate-in fade-in slide-in-from-bottom-1"
                  >
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedTopic("");
                        setIsTopicOpen(false);
                      }}
                      className={`w-full rounded-lg px-2 py-2 text-left text-xs transition-colors ${
                        !selectedTopic
                          ? "bg-pink-600 font-medium text-white"
                          : "bg-pink-50 text-gray-600 hover:bg-pink-100 hover:text-pink-700"
                      }`}
                    >
                      Kein Thema / Allgemein
                    </button>
                    {professorTopics.map((topic) => (
                      <button
                        key={topic}
                        type="button"
                        onClick={() => {
                          setSelectedTopic(topic);
                          setIsTopicOpen(false);
                        }}
                        className={`w-full truncate rounded-lg px-2 py-2 text-left text-xs font-medium transition-colors ${
                          selectedTopic === topic
                            ? "bg-pink-600 text-white"
                            : "bg-pink-50 text-gray-700 hover:bg-pink-100 hover:text-pink-700"
                        }`}
                      >
                        {topic}
                      </button>
                    ))}
                  </div>
                )}
            </div>

            <div className="relative z-10 flex items-center gap-2">
              <div className="flex min-w-0 flex-1 items-center rounded-2xl border border-gray-200 bg-white p-2.5 shadow-lg shadow-gray-100 transition-all focus-within:border-pink-500 focus-within:ring-2 focus-within:ring-pink-100">
                <input
                  type="text"
                  placeholder="Was würdest du gerne wissen?"
                  value={newQuestionText}
                  onChange={(event) => onQuestionTextChange(event.target.value)}
                  className="flex-1 bg-transparent px-3 py-1 text-sm text-gray-800 outline-none placeholder:text-gray-400"
                />
              </div>
              <button
                type="submit"
                aria-label="Frage stellen"
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-pink-600 text-white shadow-sm transition-all hover:bg-pink-700 active:scale-95"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}