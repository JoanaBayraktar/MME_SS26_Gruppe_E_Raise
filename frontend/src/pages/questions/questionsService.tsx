const API_URL = "http://localhost:4000/api/questions"; // Passe hier ggf. deinen Port an
const PROFILE_API_URL = "http://localhost:4000/api/profile"; // Passe den Endpunkt an dein Backend an

// Helper to get or create a persistent student token in browser storage
function getStudentToken(): string {
  let token = localStorage.getItem("student_token");
  if (!token) {
    token = "token_" + Math.random().toString(36).substring(2, 15);
    localStorage.setItem("student_token", token);
  }
  return token;
}

// Helper to get the current active session ID (overwritten later, defaults to "0000" for dev)
function getCurrentSessionId(): string | number {
  return localStorage.getItem("current_session_id") || "0000";
}

// Alle Fragen für eine bestimmte Session abrufen (inkl. optionaler Sortierung)
export async function fetchQuestions(sessionId?: string | number, sortBy: "newest" | "votes" = "newest") {
  const activeSession = sessionId || getCurrentSessionId();
  const response = await fetch(`${API_URL}?sessionId=${activeSession}&sortBy=${sortBy}`);
  
  if (!response.ok) {
    throw new Error("Fehler beim Laden der Fragen aus dem Backend");
  }
  return await response.json();
}

// Neue Frage an das Backend senden
export async function sendQuestion(questionData: {
  text: string;
  author?: string;
  slideNumber?: number;
  topic?: string;
  sessionId?: string | number;
}) {
  const activeSession = questionData.sessionId || getCurrentSessionId();

  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      ...questionData,
      sessionId: activeSession,
      studentToken: getStudentToken(),
    }),
  });

  if (!response.ok) {
    throw new Error("Fehler beim Speichern der Frage im Backend");
  }

  return await response.json();
}

// Vote für eine spezifische Frage abgeben / umschalten
export async function voteQuestion(questionId: number) {
  const response = await fetch(`${API_URL}/${questionId}/vote`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      studentToken: getStudentToken(),
    }),
  });

  if (!response.ok) {
    throw new Error("Fehler beim Speichern des Votes im Backend");
  }

  // Optional: falls dein Backend die aktualisierte Frage zurückgibt
  try {
    return await response.json();
  } catch {
    return null;
  }
}

// Methode ermittelt Author für Frage oder legt anonymen Namen fest
export const determineAuthorName = async (): Promise<string> => {
  try {
    const profile = await fetchUserProfile();
    if (profile?.anonym === true) {
      return "Anonym";
    }

    // Wenn nicht Anonym -> Name
    return profile?.name || "Du (Teilnehmer)";
  } catch (error) {
    console.error("Fehler beim Abrufen des Profil-Status:", error);
    // Fallback bei einem Fehler im Backend-Call
    return "Du (Teilnehmer)";
  }
};

// Backend-Aufruf von Profil
async function fetchUserProfile() {
  const response = await fetch(PROFILE_API_URL, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });
  if (!response.ok) return null; 
  return await response.json();
}