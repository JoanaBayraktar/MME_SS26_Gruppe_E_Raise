import React, { useState, useRef } from "react";
import { X, ArrowUp, Send, MessageSquare } from "lucide-react";

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

export function SingleView({ question, onClose }: SingleViewProps) {
  const [startY, setStartY] = useState<number | null>(null);
  const [currentY, setCurrentY] = useState(0);
  const [isClosing, setIsClosing] = useState(false);
  const sheetRef = useRef<HTMLDivElement>(null);

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
    }, 250); // Entspricht der Animationsdauer
  };

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

        {/* Header: "Kommentare" links, X-Button rechts */}
        <div className="flex items-center justify-between px-6 py-3 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-900">Kommentare</h2>
          <button
            type="button"
            onClick={triggerClose}
            className="p-2 rounded-full hover:bg-gray-100 text-gray-500 transition-colors"
            aria-label="Schließen"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollbarer Inhalt */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
          
          {/* Die ausgewählte Frage im angepassten Layout (wie auf dem Entwurf) */}
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

          {/* Platzhalter für die kommenden Schritte (Kommentarliste & Input folgen im nächsten Schritt) */}
          <div className="text-center py-10 text-gray-400 text-sm">
            Kommentarliste und Eingabefeld werden im nächsten Schritt hinzugefügt...
          </div>
        </div>

      </div>
    </div>
  );
}