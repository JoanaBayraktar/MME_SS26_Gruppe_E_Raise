// frontend/src/services/questionsService.ts

const API_URL = "http://localhost:4000/api/questions"; // Passe hier ggf. deinen Port an

// Alle Fragen vom Backend abrufen (GET)
export async function fetchQuestions() {
  const response = await fetch(API_URL);
  if (!response.ok) {
    throw new Error("Fehler beim Laden der Fragen aus dem Backend");
  }
  return await response.json();
}

// Neue Frage an das Backend senden (POST)
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