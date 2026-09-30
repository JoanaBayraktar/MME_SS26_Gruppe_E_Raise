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
    typ: umfrage.typ,
    status: umfrage.status,
    antwortoptionen: umfrage.antwortoptionen.map((option) => ({
      id: option.id,
      text: option.text,
    })),
  });
});

// speichert die abstimmung einer studentin oder eines studenten
umfragenRouter.post("/:id/vote", async (req, res) => {
  const umfrageId = Number(req.params.id);
  const { optionIds, studentToken } = req.body as {
    optionIds?: number[];
    studentToken?: string;
  };

  if (!Number.isInteger(umfrageId) || umfrageId <= 0) {
    return res.status(400).json({
      message: "Ungültige Umfrage-ID.",
    });
  }

  if (!studentToken || typeof studentToken !== "string") {
    return res.status(400).json({
      message: "Student-Token fehlt.",
    });
  }

  if (!Array.isArray(optionIds) || optionIds.length === 0) {
    return res.status(400).json({
      message: "Bitte wähle mindestens eine Antwort aus.",
    });
  }

  const umfrage = await prisma.umfrage.findUnique({
    where: {
      id: umfrageId,
    },
    include: {
      antwortoptionen: true,
    },
  });

  if (!umfrage) {
    return res.status(404).json({
      message: "Umfrage wurde nicht gefunden.",
    });
  }

  if (umfrage.status !== "AKTIV") {
    return res.status(400).json({
      message: "Diese Umfrage ist nicht mehr aktiv.",
    });
  }

  // bei single choice und skala darf nur eine option ausgewählt werden
  if (
    (umfrage.typ === "SINGLE_CHOICE" || umfrage.typ === "SKALA") &&
    optionIds.length !== 1
  ) {
    return res.status(400).json({
      message: "Bei dieser Umfrage darf nur eine Antwort ausgewählt werden.",
    });
  }

  const gueltigeOptionIds = new Set(
    umfrage.antwortoptionen.map((option) => option.id),
  );

  const optionenSindGueltig = optionIds.every((optionId) =>
    gueltigeOptionIds.has(optionId),
  );

  if (!optionenSindGueltig) {
    return res.status(400).json({
      message: "Mindestens eine Antwortoption gehört nicht zu dieser Umfrage.",
    });
  }

  // prüft ob für diese umfrage bereits abgestimmt wurde
  const vorhandeneAbstimmung = await prisma.abstimmung.findFirst({
    where: {
      studentToken,
      option: {
        umfrageId,
      },
    },
  });

  if (vorhandeneAbstimmung) {
    return res.status(409).json({
      message: "Du hast bereits an dieser Umfrage teilgenommen.",
    });
  }

  await prisma.abstimmung.createMany({
    data: optionIds.map((optionId) => ({
      optionId,
      studentToken,
    })),
  });

  return res.status(201).json({
    message: "Deine Stimme wurde erfolgreich abgegeben.",
  });
});
