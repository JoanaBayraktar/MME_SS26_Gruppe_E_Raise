import { Router } from "express";
import { z } from "zod";
import { prisma } from "../prisma";

const createVeranstaltungSchema = z.object({
  name: z.string().trim().min(1, "Bitte gib einen Namen ein."),
  kuerzel: z.string().trim().min(1, "Bitte gib ein Kürzel ein."),
});

export const veranstaltungenRouter = Router();

veranstaltungenRouter.get("/", async (req, res) => {
  if (!req.session.dozentId) {
    return res.status(401).json({ message: "Bitte melde dich als Dozent:in an." });
  }

  const veranstaltungen = await prisma.veranstaltung.findMany({
    where: { dozentId: req.session.dozentId },
    orderBy: { erstelltAm: "desc" },
  });

  res.json(veranstaltungen.map((v) => ({ id: v.id, name: v.name, kuerzel: v.kuerzel })));
});

veranstaltungenRouter.get("/:id", async (req, res) => {
  if (!req.session.dozentId) {
    return res.status(401).json({ message: "Bitte melde dich als Dozent:in an." });
  }

  const id = Number(req.params.id);
  const veranstaltung = await prisma.veranstaltung.findFirst({
    where: { id, dozentId: req.session.dozentId },
    include: { sessions: { orderBy: { startZeit: "desc" } } },
  });

  if (!veranstaltung) {
    return res.status(404).json({ message: "Diese Veranstaltung existiert nicht." });
  }

  res.json({
    id: veranstaltung.id,
    name: veranstaltung.name,
    kuerzel: veranstaltung.kuerzel,
    sessions: veranstaltung.sessions.map((s) => ({
      id: s.id,
      name: s.name,
      code: s.code,
      status: s.status,
    })),
  });
});

veranstaltungenRouter.post("/", async (req, res) => {
  if (!req.session.dozentId) {
    return res.status(401).json({ message: "Bitte melde dich als Dozent:in an." });
  }

  const parsed = createVeranstaltungSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: parsed.error.issues[0].message });
  }

  const veranstaltung = await prisma.veranstaltung.create({
    data: { ...parsed.data, dozentId: req.session.dozentId },
  });

  res.status(201).json({ id: veranstaltung.id, name: veranstaltung.name, kuerzel: veranstaltung.kuerzel });
});
