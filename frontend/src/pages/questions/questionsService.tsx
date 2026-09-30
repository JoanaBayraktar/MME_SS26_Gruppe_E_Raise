const API_URL = "http://localhost:4000/api/questions"; // Passe hier ggf. deinen Port an
const PROFILE_API_URL = "http://localhost:4000/api/profile"; // Passe den Endpunkt an dein Backend an

// Alle Fragen vom Backend abrufen
export async function fetchQuestions() {
  const response = await fetch(API_URL);
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
}) {
  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(questionData),
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

  if (!response.ok) {
    throw new Error("Fehler beim Laden des Benutzerprofils vom Server");
  }

  return await response.json();
}