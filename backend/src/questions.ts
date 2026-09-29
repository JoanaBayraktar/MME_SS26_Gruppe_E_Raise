import { Router } from "express";
import { prisma } from "./prisma";

const router = Router();

// GET /api/questions - Fetch all questions for a session
router.get("/", async (req, res) => {
  try {
    const { sessionId, sortBy } = req.query;

    // Find session or fallback to first session in DB
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

    // Format data to match frontend expectations
    const formatted = questions.map((q) => ({
      id: q.id,
      text: q.text,
      author: "Teilnehmer",
      time: new Date(q.erstelltAm).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      tag: q.kapitel ? `Kapitel ${q.kapitel}` : "",
      topic: q.kapitel || "Allgemein",
      slideNumber: q.folienNr || undefined,
      comments: q.kommentare.length,
      votes: q.upvotes.length,
      voted: false,
    }));

    res.json(formatted);
  } catch (error) {
    console.error("Error fetching questions:", error);
    res.status(500).json({ error: "Fehler beim Laden der Fragen" });
  }
});

// POST /api/questions - Create a new question
router.post("/", async (req, res) => {
  try {
    const { text, slideNumber, topic, studentToken } = req.body;

    // Get active session
    const session = await prisma.session.findFirst();
    if (!session) {
      return res.status(400).json({ error: "Keine aktive Session gefunden" });
    }

    const newFrage = await prisma.frage.create({
      data: {
        text,
        folienNr: slideNumber ? Number(slideNumber) : null,
        kapitel: topic || null,
        sessionId: session.id,
        studentToken: studentToken || "default-token",
      },
    });

    res.json({
      id: newFrage.id,
      text: newFrage.text,
      author: "Du (Teilnehmer)",
      time: "Gerade eben",
      tag: newFrage.kapitel ? `${newFrage.kapitel}` : "",
      topic: newFrage.kapitel || "Allgemein",
      slideNumber: newFrage.folienNr || undefined,
      comments: 0,
      votes: 0,
      voted: false,
    });
  } catch (error) {
    console.error("Error creating question:", error);
    res.status(500).json({ error: "Fehler beim Erstellen der Frage" });
  }
});

export default router;