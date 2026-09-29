import { Router } from "express";
import { prisma } from "./prisma";

const router = Router();

// abruf aller Fragen einer Session
router.get("/", async (req, res) => {
  try {
    const { sessionId, sortBy, studentToken } = req.query;

    // abfrage aktueller session oder fallback zu default
    let session = await prisma.session.findFirst();
    if (sessionId && sessionId !== "0000") {
      const foundSession = await prisma.session.findFirst({
        where: { code: String(sessionId) },
      });
      if (foundSession) session = foundSession;
    }

    if (!session) {
      return res.json([]);
    }

    const questions = await prisma.frage.findMany({
      where: { sessionId: session.id },
      include: {
        upvotes: true,
        kommentare: true,
      },
      orderBy:
        sortBy === "votes"
          ? { upvotes: { _count: "desc" } }
          : { id: "desc" },
    });

    // Datenaufbereitung für frontend
    const formatted = questions.map((q) => {
      const hasVoted = studentToken 
        ? q.upvotes.some((u) => u.studentToken === String(studentToken)) 
        : false;

      return {
        id: q.id,
        text: q.text,
        author: "Teilnehmer",
        time: new Date(q.erstelltAm).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        tag: q.kapitel ? `Kapitel ${q.kapitel}` : "",
        topic: q.kapitel || "Allgemein",
        slideNumber: q.folienNr || undefined,
        comments: q.kommentare.length,
        votes: q.upvotes.length,
        voted: hasVoted,
      };
    });

    return res.json(formatted);
  } catch (error) {
    console.error("Error fetching questions:", error);
    return res.status(500).json({ error: "Fehler beim Laden der Fragen" });
  }
});

// neue Frage anlegen
router.post("/", async (req, res) => {
  try {
    const { text, author, slideNumber, topic, sessionId, studentToken } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({ error: "Fragetext darf nicht leer sein." });
    }

    let session = await prisma.session.findFirst();
    if (sessionId && sessionId !== "0000") {
      const foundSession = await prisma.session.findFirst({
        where: { code: String(sessionId) },
      });
      if (foundSession) session = foundSession;
    }

    if (!session) {
      return res.status(404).json({ error: "Keine aktive Session gefunden." });
    }

    const newFrage = await prisma.frage.create({
      data: {
        text: text.trim(),
        folienNr: slideNumber ? Number(slideNumber) : null,
        kapitel: topic || "Allgemein",
        sessionId: session.id,
        studentToken: studentToken || `anon-${Math.random().toString(36).substring(2, 10)}`,
      },
      include: {
        upvotes: true,
        kommentare: true,
      },
    });

    const formatted = {
      id: newFrage.id,
      text: newFrage.text,
      author: author || "Teilnehmer",
      time: new Date(newFrage.erstelltAm).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      tag: newFrage.kapitel ? `Kapitel ${newFrage.kapitel}` : "",
      topic: newFrage.kapitel || "Allgemein",
      slideNumber: newFrage.folienNr || undefined,
      comments: 0,
      votes: 0,
      voted: false,
    };

    return res.status(201).json(formatted);
  } catch (error) {
    console.error("Error creating question:", error);
    return res.status(500).json({ error: "Fehler beim Erstellen der Frage" });
  }
});

// Upvote anlegen
router.post("/:id/vote", async (req, res) => {
  try {
    const { id } = req.params;
    const { studentToken } = req.body;
    const questionId = Number(id);

    if (!studentToken) {
      return res.status(400).json({ error: "StudentToken ist erforderlich." });
    }

    // Prüfen, ob bereits ein Upvote von diesem Token existiert
    const existingUpvote = await prisma.upvote.findFirst({
      where: {
        frageId: questionId,
        studentToken: String(studentToken),
      },
    });

    if (existingUpvote) {
      // Wenn bereits gevotet -> Upvote löschen (Unvote)
      await prisma.upvote.delete({
        where: { id: existingUpvote.id },
      });
    } else {
      // Ansonsten -> Upvote erstellen
      await prisma.upvote.create({
        data: {
          frageId: questionId,
          studentToken: String(studentToken),
        },
      });
    }

    // Aktualisierte Frage abrufen, um aktuelle Vote-Anzahl und Status zurückzugeben
    const updatedQuestion = await prisma.frage.findUnique({
      where: { id: questionId },
      include: { upvotes: true },
    });

    if (!updatedQuestion) {
      return res.status(404).json({ error: "Frage nicht gefunden." });
    }

    const hasVoted = updatedQuestion.upvotes.some((u) => u.studentToken === studentToken);

    return res.json({
      id: updatedQuestion.id,
      votes: updatedQuestion.upvotes.length,
      voted: hasVoted,
    });
  } catch (error) {
    console.error("Error toggling vote:", error);
    return res.status(500).json({ error: "Fehler beim Speichern des Votes" });
  }
});

export default router;