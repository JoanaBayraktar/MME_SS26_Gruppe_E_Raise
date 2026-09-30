import { Router } from "express";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "../prisma";

const SALT_ROUNDS = 10;
const PASSWORD_MIN_LENGTH = 8;
const INVALID_CREDENTIALS_MESSAGE = "E-Mail oder Passwort ist falsch.";

const registerSchema = z.object({
  vorname: z.string().trim().min(1, "Bitte gib deinen Vornamen ein."),
  nachname: z.string().trim().min(1, "Bitte gib deinen Nachnamen ein."),
  email: z.string().trim().email("Bitte gib eine gültige E-Mail-Adresse ein."),
  password: z.string().min(PASSWORD_MIN_LENGTH, `Das Passwort muss mindestens ${PASSWORD_MIN_LENGTH} Zeichen haben.`),
});

const loginSchema = z.object({
  email: z.string().trim().email(INVALID_CREDENTIALS_MESSAGE),
  password: z.string().min(1, INVALID_CREDENTIALS_MESSAGE),
});

const updateProfileSchema = z
  .object({
    vorname: z.string().trim().min(1, "Bitte gib deinen Vornamen ein."),
    nachname: z.string().trim().min(1, "Bitte gib deinen Nachnamen ein."),
    email: z.string().trim().email("Bitte gib eine gültige E-Mail-Adresse ein."),
    currentPassword: z.string().optional(),
    newPassword: z
      .string()
      .min(PASSWORD_MIN_LENGTH, `Das neue Passwort muss mindestens ${PASSWORD_MIN_LENGTH} Zeichen haben.`)
      .optional(),
  })
  .refine((data) => !data.newPassword || !!data.currentPassword, {
    message: "Bitte gib dein aktuelles Passwort ein, um ein neues zu setzen.",
    path: ["currentPassword"],
  });

function toPublicDozent(dozent: { id: number; vorname: string; nachname: string; email: string }) {
  return { id: dozent.id, vorname: dozent.vorname, nachname: dozent.nachname, email: dozent.email };
}

export const authRouter = Router();

authRouter.post("/register", async (req, res) => {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: parsed.error.issues[0].message });
  }
  const { vorname, nachname, email, password } = parsed.data;

  const existing = await prisma.dozent.findUnique({ where: { email } });
  if (existing) {
    return res.status(409).json({ message: "Für diese E-Mail-Adresse existiert bereits ein Account." });
  }

  const passwortHash = await bcrypt.hash(password, SALT_ROUNDS);
  const dozent = await prisma.dozent.create({
    data: { vorname, nachname, email, passwortHash },
  });

  req.session.dozentId = dozent.id;
  res.status(201).json(toPublicDozent(dozent));
});

authRouter.post("/login", async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: parsed.error.issues[0].message });
  }
  const { email, password } = parsed.data;

  const dozent = await prisma.dozent.findUnique({ where: { email } });
  if (!dozent) {
    return res.status(401).json({ message: INVALID_CREDENTIALS_MESSAGE });
  }

  const passwordMatches = await bcrypt.compare(password, dozent.passwortHash);
  if (!passwordMatches) {
    return res.status(401).json({ message: INVALID_CREDENTIALS_MESSAGE });
  }

  req.session.dozentId = dozent.id;
  res.json(toPublicDozent(dozent));
});

authRouter.post("/logout", (req, res) => {
  req.session.destroy(() => res.status(204).end());
});

authRouter.get("/me", async (req, res) => {
  if (!req.session.dozentId) {
    return res.status(401).json({ message: "Nicht eingeloggt." });
  }
  const dozent = await prisma.dozent.findUnique({ where: { id: req.session.dozentId } });
  if (!dozent) {
    return res.status(401).json({ message: "Nicht eingeloggt." });
  }
  res.json(toPublicDozent(dozent));
});

authRouter.patch("/me", async (req, res) => {
  if (!req.session.dozentId) {
    return res.status(401).json({ message: "Nicht eingeloggt." });
  }

  const parsed = updateProfileSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: parsed.error.issues[0].message });
  }
  const { vorname, nachname, email, currentPassword, newPassword } = parsed.data;

  const dozent = await prisma.dozent.findUnique({ where: { id: req.session.dozentId } });
  if (!dozent) {
    return res.status(401).json({ message: "Nicht eingeloggt." });
  }

  if (email !== dozent.email) {
    const existing = await prisma.dozent.findUnique({ where: { email } });
    if (existing) {
      return res.status(409).json({ message: "Für diese E-Mail-Adresse existiert bereits ein Account." });
    }
  }

  let passwortHash = dozent.passwortHash;
  if (newPassword) {
    const currentPasswordMatches = await bcrypt.compare(currentPassword!, dozent.passwortHash);
    if (!currentPasswordMatches) {
      return res.status(401).json({ message: "Aktuelles Passwort ist falsch." });
    }
    passwortHash = await bcrypt.hash(newPassword, SALT_ROUNDS);
  }

  const updated = await prisma.dozent.update({
    where: { id: dozent.id },
    data: { vorname, nachname, email, passwortHash },
  });
  res.json(toPublicDozent(updated));
});

authRouter.delete("/me", async (req, res) => {
  if (!req.session.dozentId) {
    return res.status(401).json({ message: "Nicht eingeloggt." });
  }

  await prisma.dozent.delete({ where: { id: req.session.dozentId } });
  req.session.destroy(() => res.status(204).end());
});
