const BASE_URL = (import.meta as any).env?.VITE_API_URL || "http://localhost:4000/api";
const API_URL = `${BASE_URL}/questions`;
const PROFILE_API_URL = `${BASE_URL}/profile`;

// Safe helper for localStorage (Prevents SSR crashes)
const getStorageItem = (key: string, fallback: string): string => {
  if (typeof window === "undefined") return fallback;
  return localStorage.getItem(key) || fallback;
};

// Helper to get or create a persistent student token
function getStudentToken(): string {
  if (typeof window === "undefined") return "ssr_token";
  let token = localStorage.getItem("student_token");
  if (!token) {
    token = "token_" + Math.random().toString(36).substring(2, 15);
    localStorage.setItem("student_token", token);
  }
  return token;
}

// Helper to get the current active session ID
function getCurrentSessionId(): string | number {
  return getStorageItem("current_session_id", "0000");
}

/**
 * Generic fetch wrapper to centralize headers, error handling, and JSON parsing.
 */
async function apiRequest<T>(url: string, options: RequestInit = {}): Promise<T | null> {
  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`API Fehler: ${response.statusText}`);
  }

  const text = await response.text();
  return text ? JSON.parse(text) : null;
}

export interface QuestionPayload {
  text: string;
  author?: string;
  slideNumber?: number;
  topic?: string;
  sessionId?: string | number;
}

// Alle Fragen für eine bestimmte Session abrufen (gibt im Fall der Fälle immer ein Array zurück)
export async function fetchQuestions(sessionId?: string | number, sortBy: "newest" | "votes" = "newest") {
  const activeSession = sessionId || getCurrentSessionId();
  const data = await apiRequest<any[]>(`${API_URL}?sessionId=${activeSession}&sortBy=${sortBy}`);
  return data || [];
}

// Neue Frage an das Backend senden
export async function sendQuestion(questionData: QuestionPayload) {
  const activeSession = questionData.sessionId || getCurrentSessionId();

  return apiRequest<any>(API_URL, {
    method: "POST",
    body: JSON.stringify({
      ...questionData,
      sessionId: activeSession,
      studentToken: getStudentToken(),
    }),
  });
}

// Vote für eine spezifische Frage abgeben / umschalten
export async function voteQuestion(questionId: number) {
  return apiRequest<any>(`${API_URL}/${questionId}/vote`, {
    method: "POST",
    body: JSON.stringify({
      studentToken: getStudentToken(),
    }),
  });
}

// ==========================================
// Kommentar-Funktionen für SingleView
// ==========================================

// Kommentare für eine bestimmte Frage abrufen
export async function fetchComments(questionId: number) {
  const data = await apiRequest<any[]>(`${API_URL}/${questionId}/comments`);
  return data || [];
}

// Neuen Kommentar für eine Frage senden
export async function sendComment(questionId: number, text: string) {
  return apiRequest<any>(`${API_URL}/${questionId}/comments`, {
    method: "POST",
    body: JSON.stringify({
      text,
      studentToken: getStudentToken(),
    }),
  });
}

// Vote für einen spezifischen Kommentar umschalten
export async function voteComment(commentId: number) {
  return apiRequest<any>(`${BASE_URL}/comments/${commentId}/vote`, {
    method: "POST",
    body: JSON.stringify({
      studentToken: getStudentToken(),
    }),
  });
}

// ==========================================

// Backend-Aufruf von Profil
async function fetchUserProfile() {
  try {
    return await apiRequest<any>(PROFILE_API_URL, { method: "GET" });
  } catch {
    return null;
  }
}

// Methode ermittelt Author für Frage oder legt anonymen Namen fest
export async function determineAuthorName(): Promise<string> {
  try {
    const profileData = await fetchUserProfile();
    if (profileData?.anonym === true) {
      return "Anonym";
    }
    return profileData?.name || "Du (Teilnehmer)";
  } catch (error) {
    console.error("Fehler beim Abrufen des Profil-Status:", error);
    return "Du (Teilnehmer)";
  }
}