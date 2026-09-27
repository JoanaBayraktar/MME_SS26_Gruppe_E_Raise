import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate, Outlet } from "react-router-dom";
import { ROUTES } from "../routes";

export interface Question {
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

export interface QuestionMetadata {
  slideNumber?: number;
  topic?: string;
}

interface PollOption {
  text: string;
  votes: number;
  percent: number;
}

interface Poll {
  id: number;
  question: string;
  options: PollOption[];
  totalVotes: number;
  voted: boolean;
}

export interface NavigationPageContext {
  questions: Question[];
  newQuestionText: string;
  onQuestionTextChange: (text: string) => void;
  onAddQuestion: (metadata: QuestionMetadata) => void;
  onVote: (questionId: number) => void;
  polls: Poll[];
  onPollVote: (pollId: number, optionIndex: number) => void;
}

const INITIAL_QUESTIONS: Question[] = [
  {
    id: 1,
    author: "Anonymer Fuchs",
    time: "10:22",
    text: "Können wir Folie 12 nochmal genauer durchgehen?",
    tag: "gefragt",
    topic: "Einführung & Grundlagen",
    comments: 3,
    votes: 14,
    voted: false,
  },
  {
    id: 2,
    author: "Lena Mayr",
    time: "10:18",
    text: "Wie hängt das mit dem Beispiel aus der letzten Woche zusammen?",
    tag: "Diskussion",
    topic: "Diskussion & Ausblick",
    comments: 5,
    votes: 9,
    voted: false,
  },
];

const INITIAL_POLLS: Poll[] = [
  {
    id: 1,
    question: "Haben Sie den aktuellen Vorlesungsstoff verstanden?",
    options: [
      { text: "Ja, alles klar", votes: 24, percent: 65 },
      { text: "Teilweise, muss nacharbeiten", votes: 11, percent: 30 },
      { text: "Nein, bitte nochmals erklären", votes: 2, percent: 5 },
    ],
    totalVotes: 37,
    voted: false,
  },
];

const TABS = [
  { id: "questions", label: "Fragen", path: ROUTES.QUESTIONS },
  { id: "umfrage", label: "Umfrage", path: ROUTES.UMFRAGE },
  { id: "archiv", label: "Archiv", path: ROUTES.ARCHIV },
] as const;

export default function NavigationPage() {
  const [questions, setQuestions] = useState(INITIAL_QUESTIONS);
  const [polls, setPolls] = useState(INITIAL_POLLS);
  const [newQuestionText, setNewQuestionText] = useState("");
  const [isContentScrolling, setIsContentScrolling] = useState(false);
  const scrollEndTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const activeTab = TABS.find((tab) => pathname.endsWith(`/${tab.id}`))?.id ?? "questions";

  useEffect(
    () => () => {
      if (scrollEndTimeout.current) clearTimeout(scrollEndTimeout.current);
    },
    [],
  );

  const handleContentScroll = () => {
    setIsContentScrolling(true);
    if (scrollEndTimeout.current) clearTimeout(scrollEndTimeout.current);
    scrollEndTimeout.current = setTimeout(() => setIsContentScrolling(false), 1000);
  };

  const handleAddQuestion = ({ slideNumber, topic }: QuestionMetadata) => {
    const text = newQuestionText.trim();
    if (!text) return;

    setQuestions((current) => [
      {
        id: Date.now(),
        author: "Du (Teilnehmer)",
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        text,
        tag: "neu",
        ...(slideNumber ? { slideNumber } : {}),
        ...(topic ? { topic } : {}),
        comments: 0,
        votes: 1,
        voted: true,
      },
      ...current,
    ]);
    setNewQuestionText("");
  };

  const handleVote = (questionId: number) => {
    setQuestions((current) =>
      current.map((question) =>
        question.id === questionId
          ? {
              ...question,
              votes: question.voted ? question.votes - 1 : question.votes + 1,
              voted: !question.voted,
            }
          : question,
      ),
    );
  };

  const handlePollVote = (pollId: number, optionIndex: number) => {
    setPolls((current) =>
      current.map((poll) => {
        if (poll.id !== pollId || poll.voted) return poll;

        const totalVotes = poll.totalVotes + 1;
        const options = poll.options.map((option, index) => ({
          ...option,
          votes: option.votes + (index === optionIndex ? 1 : 0),
        }));
        const recalculatedOptions = options.map((option) => ({
          ...option,
          percent: Math.round((option.votes / totalVotes) * 100),
        }));

        return { ...poll, options: recalculatedOptions, totalVotes, voted: true };
      }),
    );
  };

  const outletContext: NavigationPageContext = {
    questions,
    newQuestionText,
    onQuestionTextChange: setNewQuestionText,
    onAddQuestion: handleAddQuestion,
    onVote: handleVote,
    polls,
    onPollVote: handlePollVote,
  };

  return (
    <div className="flex h-[100dvh] w-full flex-col overflow-hidden bg-white">
      <header className="shrink-0 border-b border-gray-200 bg-white px-5 pb-0 pt-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-gray-900">MME Blockkurs</h1>
            <p className="mt-0.5 text-sm text-gray-500">Session 3 · Mo 10:15</p>
          </div>
          <span className="rounded-full bg-pink-100 px-3 py-1 text-sm font-semibold text-pink-600">
            #2468
          </span>
        </div>

        <nav aria-label="Bereiche" className="mt-5 flex justify-center space-x-10">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                aria-current={isActive ? "page" : undefined}
                onClick={() => navigate(tab.path)}
                className={`relative pb-3 text-base font-medium transition-colors ${
                  isActive ? "font-semibold text-pink-600" : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {tab.label}
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-1 animate-fade-in rounded-t-full bg-pink-600" />
                )}
              </button>
            );
          })}
        </nav>
      </header>

      <main
        onScroll={handleContentScroll}
        className={`min-h-0 flex-1 overflow-y-auto bg-gray-50 p-4 pb-20 scrollbar-fade ${
          isContentScrolling ? "scrollbar-fade-visible" : ""
        }`}
      >
        <Outlet context={outletContext} />
      </main>
    </div>
  );
}
