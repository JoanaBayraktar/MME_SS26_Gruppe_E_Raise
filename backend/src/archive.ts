import { Router, Request, Response } from "express";
// Importiere hier deinen Prisma Client oder deine Datenbankverbindung
// import { prisma } from "../lib/prisma";

const router = Router();

/**
 * GET /api/sessions/archive
 * Gibt alle archivierten Sessions mit Anzahl der gestellten Fragen zurück.
 */
router.get("/", async (req: Request, res: Response) => {
  try {
    /* 
      Beispielhafte Prisma-Abfrage (an dein Schema angepasst):
      const archivedSessions = await prisma.session.findMany({
        where: { status: "ARCHIVED" },
        include: {
          _count: {
            select: { questions: true },
          },
        },
        orderBy: { createdAt: "desc" },
      });

      const formatted = archivedSessions.map(s => ({
        id: s.id,
        title: s.name,
        date: s.createdAt.toLocaleDateString("de-DE"),
        questionsCount: s._count.questions,
      }));

      return res.json(formatted);
    */

    // Fallback-Mockdaten, falls die DB-Anbindung noch konfiguriert wird:
    const mockArchivedSessions = [
      {
        id: 5,
        title: "Session 05 - MongoDB Backend",
        date: "06.08.2026",
        questionsCount: 11,
      },
      {
        id: 6,
        title: "Session 06 - CSS Stylesheets",
        date: "06.08.2026",
        questionsCount: 6,
      },
      {
        id: 7,
        title: "Session 07 - HiFi Prototyp",
        date: "06.08.2026",
        questionsCount: 13,
      },
      {
        id: 8,
        title: "Session 08 - ER-Diagramme",
        date: "06.08.2026",
        questionsCount: 4,
      },
    ];

    return res.json(mockArchivedSessions);
  } catch (error) {
    console.error("Fehler beim Abrufen des Archivs:", error);
    return res.status(500).json({ error: "Interner Serverfehler beim Laden des Archivs." });
  }
});

export default router;