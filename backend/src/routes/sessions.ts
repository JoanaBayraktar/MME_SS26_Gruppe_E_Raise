import { Router } from "express";
import { z } from "zod";
import { SessionStatus } from "@prisma/client";
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

// Sessions mit autoStart=true haben keinen von Hand gepflegten Status – der
// Status ergibt sich aus Start-/Endzeit im Vergleich zu "jetzt", ähnlich wie
// computeVeranstaltungStatus() das für Veranstaltungen macht.
function computeSessionStatus(session: {
  status: SessionStatus;
  autoStart: boolean;
  startZeit: Date;
  endZeit: Date | null;
}): SessionStatus {
  if (!session.autoStart) return session.status;

  const now = new Date();
  if (now < session.startZeit) return "GEPLANT";
  if (session.endZeit && now >= session.endZeit) return "BEENDET";
  return "LAUFEND";
}

const createSessionSchema = z
  .object({
    veranstaltungId: z.number().int().positive(),
    name: z.string().trim().min(1, "Bitte gib einen Sitzungsnamen ein."),
    startZeit: z.string().refine((value) => !Number.isNaN(Date.parse(value)), "Bitte gib ein gültiges Datum ein."),
    endZeit: z.string().refine((value) => !Number.isNaN(Date.parse(value)), "Bitte gib ein gültiges Datum ein."),
    autoStart: z.boolean().default(true),
    code: z
      .string()
      .trim()
      .toUpperCase()
      .length(CODE_LENGTH, `Der Code muss ${CODE_LENGTH} Zeichen lang sein.`)
      .optional(),
  })
  .refine((data) => new Date(data.endZeit) > new Date(data.startZeit), {
    message: "Das Ende muss nach dem Start liegen.",
    path: ["endZeit"],
  });

export const sessionsRouter = Router();

sessionsRouter.get("/code", async (req, res) => {
  if (!req.session.dozentId) {
    return res.status(401).json({ message: "Bitte melde dich als Dozent:in an." });
  }

  const code = await generateUniqueCode();
  res.json({ code });
});

sessionsRouter.get("/by-code/:code", async (req, res) => {
  const code = req.params.code.trim().toUpperCase();
  const session = await prisma.session.findUnique({ where: { code } });

  if (!session || computeSessionStatus(session) === "BEENDET") {
    return res.status(404).json({ message: "Diese Session existiert nicht oder ist beendet." });
  }

  res.json({ id: session.id, name: session.name, status: computeSessionStatus(session) });
});

sessionsRouter.get("/", async (req, res) => {
  if (!req.session.dozentId) {
    return res.status(401).json({ message: "Bitte melde dich als Dozent:in an." });
  }

  const sessions = await prisma.session.findMany({
    where: { veranstaltung: { dozentId: req.session.dozentId } },
    orderBy: { startZeit: "desc" },
    include: { veranstaltung: true },
  });

  res.json(
    sessions.map((s) => ({
      id: s.id,
      name: s.name,
      code: s.code,
      status: computeSessionStatus(s),
      datum: s.datum,
      veranstaltungId: s.veranstaltungId,
      veranstaltungName: s.veranstaltung.name,
    }))
  );
});

sessionsRouter.get("/:id", async (req, res) => {
  if (!req.session.dozentId) {
    return res.status(401).json({ message: "Bitte melde dich als Dozent:in an." });
  }

  const id = Number(req.params.id);
  if (!Number.isInteger(id)) {
    return res.status(404).json({ message: "Diese Session existiert nicht." });
  }

  const session = await prisma.session.findFirst({
    where: { id, veranstaltung: { dozentId: req.session.dozentId } },
    include: { veranstaltung: true },
  });
  if (!session) {
    return res.status(404).json({ message: "Diese Session existiert nicht." });
  }

  res.json({
    id: session.id,
    name: session.name,
    code: session.code,
    status: computeSessionStatus(session),
    datum: session.datum,
    startZeit: session.startZeit,
    endZeit: session.endZeit,
    veranstaltungName: session.veranstaltung.name,
  });
});

sessionsRouter.get("/active", async (req, res) => {
  if (!req.session.dozentId) {
    return res.status(401).json({ message: "Bitte melde dich als Dozent:in an." });
  }

  const candidates = await prisma.session.findMany({
    where: {
      veranstaltung: { dozentId: req.session.dozentId },
      OR: [{ autoStart: true }, { status: "LAUFEND" }],
    },
    include: { veranstaltung: true },
  });
  const session = candidates.find((s) => computeSessionStatus(s) === "LAUFEND");

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
  const { veranstaltungId, name, startZeit, endZeit, autoStart, code: requestedCode } = parsed.data;

  const veranstaltung = await prisma.veranstaltung.findFirst({
    where: { id: veranstaltungId, dozentId: req.session.dozentId },
  });
  if (!veranstaltung) {
    return res.status(404).json({ message: "Diese Veranstaltung existiert nicht." });
  }

  let code = requestedCode;
  if (code) {
    const existing = await prisma.session.findUnique({ where: { code } });
    if (existing) {
      return res.status(409).json({ message: "Dieser Session-Code ist bereits vergeben." });
    }
  } else {
    code = await generateUniqueCode();
  }

  const startDate = new Date(startZeit);
  const endDate = new Date(endZeit);

  const session = await prisma.session.create({
    data: {
      veranstaltungId: veranstaltung.id,
      name,
      datum: startDate,
      startZeit: startDate,
      endZeit: endDate,
      autoStart,
      code,
      qrCode: code,
    },
  });

  res.status(201).json({
    id: session.id,
    name: session.name,
    code: session.code,
    status: computeSessionStatus(session),
  });
});
