import { Router } from "express";
import { prisma } from "./prisma";

const router = Router();

// Session-Statistiken für den Beendet-Screen laden
router.get("/:id/stats", async (req, res) => {
  try {
    const rawId = req.params.id;
    const numericId = Number(rawId);

    // Session flexibel über ID oder Code finden (falls Frontend den Code übergibt)
    let session = null;
    if (!isNaN(numericId)) {
      session = await prisma.session.findUnique({
        where: { id: numericId },
      });
    }

    if (!session) {
      session = await prisma.session.findUnique({
        where: { code: String(rawId) },
      });
    }

    if (!session) {
      return res.status(404).json({ error: "Session nicht gefunden" });
    }

    const sessionId = session.id;

    // 1. Fragen aufsummieren
    const totalQuestions = await prisma.frage.count({
      where: { sessionId },
    });

    // 2. Umfragen aufsummieren (existiert im Schema)
    const totalPolls = await prisma.umfrage.count({
      where: { sessionId },
    });

    // 3. Eindeutige Teilnehmende ermitteln über:
    //    - Fragen (studentToken)
    //    - Upvotes (studentToken)
    //    - Abstimmungen in Umfragen (studentToken)
    const [fragenTokens, upvoteTokens, abstimmungTokens] = await Promise.all([
      prisma.frage.findMany({
        where: { sessionId },
        select: { studentToken: true },
      }),
      prisma.upvote.findMany({
        where: { frage: { sessionId } },
        select: { studentToken: true },
      }),
      prisma.abstimmung.findMany({
        where: { option: { umfrage: { sessionId } } },
        select: { studentToken: true },
      }),
    ]);

    // Alle Tokens in ein Set werfen, um Duplikate zu entfernen und echte eindeutige User zu zählen
    const uniqueTokens = new Set<string>();
    fragenTokens.forEach((f) => { if (f.studentToken) uniqueTokens.add(f.studentToken); });
    upvoteTokens.forEach((u) => { if (u.studentToken) uniqueTokens.add(u.studentToken); });
    abstimmungTokens.forEach((a) => { if (a.studentToken) uniqueTokens.add(a.studentToken); });

    return res.json({
      sessionName: session.name,
      totalQuestions,
      totalPolls,
      participantCount: uniqueTokens.size,
    });
  } catch (error) {
    console.error("Fehler beim Laden der Session-Stats:", error);
    return res.status(500).json({ error: "Fehler beim Laden der Statistiken" });
  }
});

// Session schließen und Status aktualisieren (flexibel über ID oder Code)
router.post("/:id/close", async (req, res) => {
  try {
    const rawId = req.params.id;
    const numericId = Number(rawId);

    let session = null;
    if (!isNaN(numericId)) {
      session = await prisma.session.findUnique({
        where: { id: numericId },
      });
    }

    if (!session) {
      session = await prisma.session.findUnique({
        where: { code: String(rawId) },
      });
    }

    if (!session) {
      return res.status(404).json({ error: "Session nicht gefunden" });
    }

    await prisma.session.update({
      where: { id: session.id },
      data: { status: "BEENDET" }, // Entspricht dem SessionStatus Enum im Schema
    });

    return res.json({ success: true });
  } catch (error) {
    console.error("Fehler beim Schließen der Session:", error);
    return res.status(500).json({ error: "Session konnte nicht geschlossen werden" });
  }
});

export default router;