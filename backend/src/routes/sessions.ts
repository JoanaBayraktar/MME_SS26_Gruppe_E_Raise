import { Router } from "express";
import { z } from "zod";
import { prisma } from "../prisma";

const CODE_LENGTH = 6;
const CODE_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
const CODE_GENERATION_MAX_ATTEMPTS = 10;

function generateCode(): string {
  let code = "";
  for (let i = 0; i < CODE_LENGTH; i++) {
    code += CODE_ALPHABET[Math.floor(Math.random() * CODE_ALPHABET.length)];
  }
  return code;
}

async function generateUniqueCode(): Promise<string> {
  for (let attempt = 0; attempt < CODE_GENERATION_MAX_ATTEMPTS; attempt++) {
    const code = generateCode();
    const existing = await prisma.session.findUnique({ where: { code } });
    if (!existing) return code;
  }
  throw new Error("Konnte keinen eindeutigen Code generieren.");
}

const createSessionSchema = z.object({
  veranstaltungId: z.number().int().positive(),
  name: z.string().trim().min(1, "Bitte gib einen Sitzungsnamen ein."),
  startZeit: z.string().refine((value) => !Number.isNaN(Date.parse(value)), "Bitte gib ein gültiges Datum ein."),
});

export const sessionsRouter = Router();

sessionsRouter.get("/by-code/:code", async (req, res) => {
  const code = req.params.code.trim().toUpperCase();
  const session = await prisma.session.findUnique({ where: { code } });

  if (!session || session.status === "BEENDET") {
    return res.status(404).json({ message: "Diese Session existiert nicht oder ist beendet." });
  }

  res.json({ id: session.id, name: session.name, status: session.status });
});

sessionsRouter.get("/active", async (req, res) => {
  if (!req.session.dozentId) {
    return res.status(401).json({ message: "Bitte melde dich als Dozent:in an." });
  }

  const session = await prisma.session.findFirst({
    where: { status: "LAUFEND", veranstaltung: { dozentId: req.session.dozentId } },
    include: { veranstaltung: true },
  });

  if (!session) {
    return res.json(null);
  }

  res.json({
    id: session.id,
    name: session.name,
    code: session.code,
    startZeit: session.startZeit,
    veranstaltungName: session.veranstaltung.name,
  });
});

sessionsRouter.post("/", async (req, res) => {
  if (!req.session.dozentId) {
    return res.status(401).json({ message: "Bitte melde dich als Dozent:in an." });
  }

  const parsed = createSessionSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: parsed.error.issues[0].message });
  }
  const { veranstaltungId, name, startZeit } = parsed.data;

  const veranstaltung = await prisma.veranstaltung.findFirst({
    where: { id: veranstaltungId, dozentId: req.session.dozentId },
  });
  if (!veranstaltung) {
    return res.status(404).json({ message: "Diese Veranstaltung existiert nicht." });
  }

  const code = await generateUniqueCode();
  const startDate = new Date(startZeit);

  const session = await prisma.session.create({
    data: {
      veranstaltungId: veranstaltung.id,
      name,
      datum: startDate,
      startZeit: startDate,
      code,
      qrCode: code,
    },
  });

  res.status(201).json({ id: session.id, name: session.name, code: session.code, status: session.status });
});
