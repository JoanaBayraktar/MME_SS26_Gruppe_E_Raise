import { Router } from "express";
import { prisma } from "../prisma";

export const umfragenRouter = Router();

// liefert die aktuell aktive umfrage einer session
umfragenRouter.get("/active", async (req, res) => {
  const sessionId = Number(req.query.sessionId);

  if (!Number.isInteger(sessionId) || sessionId <= 0) {
    return res.status(400).json({
      message: "Bitte gib eine gültige Session-ID an.",
    });
  }

  const umfrage = await prisma.umfrage.findFirst({
    where: {
      sessionId,
      status: "AKTIV",
    },
    orderBy: {
      erstelltAm: "desc",
    },
    include: {
      antwortoptionen: {
        orderBy: {
          id: "asc",
        },
      },
    },
  });

  if (!umfrage) {
    return res.json(null);
  }

  res.json({
    id: umfrage.id,
    frageText: umfrage.frageText,
    status: umfrage.status,
    antwortoptionen: umfrage.antwortoptionen.map((option) => ({
      id: option.id,
      text: option.text,
    })),
  });
});
