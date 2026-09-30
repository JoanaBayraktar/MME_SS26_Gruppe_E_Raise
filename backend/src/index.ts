import express from "express";
import cors from "cors";
import session from "express-session";
import { createServer } from "http";
import { Server } from "socket.io";
import { prisma } from "./prisma";
import questionsRouter from "./questions";
import commentsRouter from "./comments";
import { authRouter } from "./routes/auth";
import { sessionsRouter } from "./routes/sessions";
import { veranstaltungenRouter } from "./routes/veranstaltungen";

// Environment Configuration
const PORT = process.env.PORT ? Number(process.env.PORT) : 4000;
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN ?? "http://localhost:5173";
const SESSION_SECRET = process.env.SESSION_SECRET ?? "dev-secret-change-me";

// Initialize Express & HTTP Server
const app = express();
const httpServer = createServer(app);

// Socket.io Setup
const io = new Server(httpServer, {
  cors: { origin: FRONTEND_ORIGIN, credentials: true },
});

// Middleware
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

app.use("/api/auth", authRouter);
app.use("/api/sessions", sessionsRouter);
app.use("/api/veranstaltungen", veranstaltungenRouter);

// --- API ROUTES ---
app.use("/api/questions", questionsRouter);
app.use("/api/comments", commentsRouter);

// Profile mock (prevents 404 errors from determineAuthorName in frontend)
app.get("/api/profile", (_req, res) => {
  res.json({ name: "Teilnehmer", anonym: false });
});

// simple healthcheck, prueft auch die DB-Verbindung
app.use("/api/auth", authRouter);
app.use("/api/sessions", sessionsRouter);
app.use("/api/veranstaltungen", veranstaltungenRouter);
app.get("/api/health", async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: "ok", db: "connected" });
  } catch (err) {
    res.status(500).json({ status: "error", db: "not connected" });
  }
});

// --- SOCKET.IO ---
io.on("connection", (socket) => {
  socket.on("session:join", (sessionCode: string) => {
    socket.join(`session:${sessionCode}`);
  });
});

// --- START SERVER ---
httpServer.listen(PORT, () => {
  console.log(`🚀 Backend läuft auf Port ${PORT}`);
});