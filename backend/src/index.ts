import express from "express";
import cors from "cors";
import session from "express-session";
import { createServer } from "http";
import { Server } from "socket.io";
import { prisma } from "./prisma";

const PORT = process.env.PORT ? Number(process.env.PORT) : 4000;
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN ?? "http://localhost:5173";
const SESSION_SECRET = process.env.SESSION_SECRET ?? "dev-secret-change-me";

const app = express();
app.use(cors({ origin: FRONTEND_ORIGIN, credentials: true }));
app.use(express.json());
app.use(
  session({
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { httpOnly: true, sameSite: "lax" },
  })
);

// simple healthcheck, prueft auch die DB-Verbindung
app.get("/api/health", async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: "ok", db: "connected" });
  } catch (err) {
    res.status(500).json({ status: "error", db: "not connected" });
  }
});

// Abrufen von Fragen der session und Aufbereitung für Frontend
app.get("/api/questions", async (req, res) => {
  try {
    const sessionId = req.query.sessionId ? Number(req.query.sessionId) : 1;
    const fragen = await prisma.frage.findMany({
      where: { sessionId },
      orderBy: { erstelltAm: "desc" },
      include: {
        upvotes: true,
        kommentare: true,
      },
    });

    const formatted = fragen.map((f) => ({
      id: f.id,
      author: f.studentToken ? "Du (Teilnehmer)" : "Anonym",
      time: new Date(f.erstelltAm).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      text: f.text,
      tag: f.kapitel || "",
      topic: f.kapitel || "Allgemein",
      slideNumber: f.folienNr,
      comments: f.kommentare.length,
      votes: f.upvotes.length,
      voted: false,
    }));

    res.json(formatted);
  } catch (err) {
    console.error("Fehler beim Laden der Fragen:", err);
    res.status(500).json({ error: "Fehler beim Laden der Fragen" });
  }
});

// Abspeicherung neuer Fragen mit zugehöriger Session-ID und Student-Token in DB
app.post("/api/questions", async (req, res) => {
  try {
    const { text, sessionId, studentToken, slideNumber, topic } = req.body;

    if (!text) {
      return res.status(400).json({ error: "Text ist erforderlich" });
    }

    const newQuestion = await prisma.frage.create({
      data: {
        text,
        sessionId: Number(sessionId || 1),
        studentToken: studentToken || "anonymous",
        folienNr: slideNumber ? Number(slideNumber) : null,
        kapitel: topic || "Allgemein",
        status: "NEU",
      },
      include: {
        upvotes: true,
        kommentare: true,
      },
    });

    res.status(201).json({
      id: newQuestion.id,
      author: "Du (Teilnehmer)",
      time: "Gerade eben",
      text: newQuestion.text,
      tag: newQuestion.kapitel || "",
      topic: newQuestion.kapitel || "Allgemein",
      slideNumber: newQuestion.folienNr,
      comments: 0,
      votes: 0,
      voted: false,
    });
  } catch (err) {
    console.error("Fehler beim Speichern der Frage:", err);
    res.status(500).json({ error: "Fehler beim Speichern der Frage" });
  }
});

// Endpunkt für Profilermittlung bei Fragen
app.get("/api/profile", (req, res) => {
  res.json({ anonym: false, name: "Du (Teilnehmer)" });
});

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: { origin: FRONTEND_ORIGIN, credentials: true },
});

io.on("connection", (socket) => {
  socket.on("session:join", (sessionCode: string) => {
    socket.join(`session:${sessionCode}`);
  });
});

httpServer.listen(PORT, () => {
  console.log(`Backend läuft auf Port ${PORT}`);
});