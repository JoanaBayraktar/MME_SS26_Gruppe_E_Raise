import { Router } from "express";
import { prisma } from "./prisma";

const router = Router();

// ==========================================
// 1. FRAGEN-ROUTEN
// ==========================================

router.get("/", async (req, res) => {
  try {
    const { sessionId, sortBy, studentToken } = req.query;

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
    console.error("Fehler beim Abrufen der Fragen:", error);
    return res.status(500).json({ error: "Fehler beim Laden der Fragen" });
  }
});

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
    console.error("Fehler beim Erstellen der Frage:", error);
    return res.status(500).json({ error: "Fehler beim Erstellen der Frage" });
  }
});

router.post("/:id/vote", async (req, res) => {
  try {
    const { id } = req.params;
    const { studentToken } = req.body;
    const questionId = Number(id);

    if (!studentToken) {
      return res.status(400).json({ error: "StudentToken ist erforderlich." });
    }

    const existingUpvote = await prisma.upvote.findFirst({
      where: {
        frageId: questionId,
        studentToken: String(studentToken),
      },
    });

    if (existingUpvote) {
      await prisma.upvote.delete({
        where: { id: existingUpvote.id },
      });
    } else {
      await prisma.upvote.create({
        data: {
          frageId: questionId,
          studentToken: String(studentToken),
        },
      });
    }

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
    console.error("Fehler beim Umschalten des Votes:", error);
    return res.status(500).json({ error: "Fehler beim Speichern des Votes" });
  }
});


// ==========================================
// 2. KOMMENTAR-ROUTEN
// ==========================================

// Alle Kommentare für eine spezifische Frage abrufen (ohne ungültiges include)
router.get("/:id/comments", async (req, res) => {
  try {
    const questionId = Number(req.params.id);
    const { studentToken } = req.query;

    const kommentare = await prisma.kommentar.findMany({
      where: { frageId: questionId },
      orderBy: { erstelltAm: "asc" },
    });

    const formattedComments = kommentare.map((k) => {
      return {
        id: k.id,
        frageId: k.frageId,
        author: k.isDozent ? "Dozent" : "Anonymer Nutzer",
        isMe: studentToken ? k.studentToken === String(studentToken) : false,
        isDozent: k.isDozent,
        time: new Date(k.erstelltAm).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        text: k.text,
        votes: 0, // Vorerst 0, da Upvotes für Kommentare noch nicht in DB sind
        voted: false,
        erstelltAm: k.erstelltAm,
      };
    });

    return res.json(formattedComments);
  } catch (error) {
    console.error("Fehler beim Laden der Kommentare:", error);
    return res.status(500).json({ error: "Fehler beim Laden der Kommentare" });
  }
});

// Neuen Kommentar erstellen
router.post("/:id/comments", async (req, res) => {
  try {
    const questionId = Number(req.params.id);
    const { text, studentToken, isDozent } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({ error: "Kommentartext darf nicht leer sein." });
    }

    const newKommentar = await prisma.kommentar.create({
      data: {
        frageId: questionId,
        text: text.trim(),
        studentToken: studentToken || null,
        isDozent: isDozent || false,
      },
    });

    const formattedComment = {
      id: newKommentar.id,
      frageId: newKommentar.frageId,
      author: newKommentar.isDozent ? "Dozent" : "Anonymer Nutzer",
      isMe: true,
      isDozent: newKommentar.isDozent,
      time: new Date(newKommentar.erstelltAm).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      text: newKommentar.text,
      votes: 0,
      voted: false,
      erstelltAm: newKommentar.erstelltAm,
    };

    return res.status(201).json(formattedComment);
  } catch (error) {
    console.error("Fehler beim Erstellen des Kommentars:", error);
    return res.status(500).json({ error: "Fehler beim Erstellen des Kommentars" });
  }
});

export default router;