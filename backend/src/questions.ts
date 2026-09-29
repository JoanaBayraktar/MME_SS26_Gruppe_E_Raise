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
// POST /api/questions/:id/vote - Toggle vote for a specific question
router.post("/:id/vote", async (req, res) => {
  try {
    const questionId = Number(req.params.id);
    const { studentToken } = req.body;

    if (!studentToken) {
      return res.status(400).json({ error: "Student token is required" });
    }

    // Check if the question exists
    const question = await prisma.frage.findUnique({
      where: { id: questionId },
      include: { upvotes: true },
    });

    if (!question) {
      return res.status(404).json({ error: "Frage nicht gefunden" });
    }

    // Check if this student has already voted for this question
    // (Note: Adjust "frageId" and "studentToken" field names if your Prisma schema differs)
    const existingVote = await prisma.upvote.findFirst({
      where: {
        frageId: questionId,
        studentToken: studentToken,
      },
    });

    let voted = false;

    if (existingVote) {
      // If already voted, remove the vote (toggle off)
      await prisma.upvote.delete({
        where: { id: existingVote.id },
      });
      voted = false;
    } else {
      // Otherwise, create a new vote (toggle on)
      await prisma.upvote.create({
        data: {
          frageId: questionId,
          studentToken: studentToken,
        },
      });
      voted = true;
    }

    // Fetch the updated count of upvotes
    const updatedQuestion = await prisma.frage.findUnique({
      where: { id: questionId },
      include: { upvotes: true },
    });

    res.json({
      id: questionId,
      votes: updatedQuestion?.upvotes.length || 0,
      voted: voted,
    });
  } catch (error) {
    console.error("Error handling vote:", error);
    res.status(500).json({ error: "Fehler beim Verarbeiten des Votes" });
  }
});

export default router;