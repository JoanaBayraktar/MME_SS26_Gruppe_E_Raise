import { Router, Request, Response } from "express";
// Passe den Pfad zu deiner Prisma-Instanz an dein Projekt an
import { prisma } from "../lib/prisma";

const router = Router();

/**
 * GET /api/archiv
 * Gibt alle archivierten Einträge (Fragen/Antworten) inklusive Veranstaltungsname zurück.
 */
router.get("/", async (req: Request, res: Response) => {
  try {
    const archivedEntries = await prisma.archivEintrag.findMany({
      include: {
        veranstaltung: true, // Lädt die verknüpfte Veranstaltung, um an den Namen zu kommen
      },
      orderBy: {
        erstelltAm: "desc", // Chronologisch sortiert (neueste zuerst)
      },
    });

    const formatted = archivedEntries.map((e) => ({
      id: e.id,
      veranstaltungId: e.veranstaltungId,
      veranstaltungName: e.veranstaltung.name,
      kapitel: e.kapitel,
      folienNr: e.folienNr,
      frageText: e.frageText,
      antwortText: e.antwortText,
      erstelltAm: e.erstelltAm.toISOString(),
    }));

    return res.json(formatted);
  } catch (error) {
    console.error("Fehler beim Abrufen des Archivs:", error);
    return res.status(500).json({ error: "Interner Serverfehler beim Laden des Archivs." });
  }
});

export default router;