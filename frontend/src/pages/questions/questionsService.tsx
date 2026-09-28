const API_URL = "http://localhost:4000/api/questions";
const PROFILE_API_URL = "http://localhost:4000/api/profile";

// Helper to get or create a persistent student token in browser storage
function getStudentToken(): string {
  let token = localStorage.getItem("student_token");
  if (!token) {
token = "token_" + Math.random().toString(36).substring(2, 15);
    localStorage.setItem("student_token", token);
  }
  return token;
}

// Alle Fragen für eine bestimmte Session abrufen
export async function fetchQuestions(sessionId: number = 1) {
  const response = await fetch(`${API_URL}?sessionId=${sessionId}`);
  if (!response.ok) {
    throw new Error("Fehler beim Laden der Fragen aus dem Backend");
  }
  return await response.json();
}

// Neue Frage an das Backend senden (inkl. sessionId & studentToken)
export async function sendQuestion(questionData: {
  text: string;
  author?: string;
  slideNumber?: number;
  topic?: string;
  sessionId?: number;
}) {
  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      ...questionData,
      sessionId: questionData.sessionId || 1, // Fallback auf Test-Session 1
      studentToken: getStudentToken(),
    }),
  });

  if (!response.ok) {
    throw new Error("Fehler beim Speichern der Frage im Backend");
  }

  return await response.json();
}

// Methode ermittelt Author für Frage oder legt anonymen Namen fest
export const determineAuthorName = async (): Promise<string> => {
  try {
    const profile = await fetchUserProfile();
    if (profile?.anonym === true) {
      return "Anonym";
    }
    return profile?.name || "Du (Teilnehmer)";
  } catch (error) {
    return "Du (Teilnehmer)";
  }
};

async function fetchUserProfile() {
  const response = await fetch(PROFILE_API_URL, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });
  if (!response.ok) return null; // Safe fallback if profile API isn't built yet
  return await response.json();
}