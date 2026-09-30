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
import { umfragenRouter } from "./routes/umfragen";

// Environment Configuration
const PORT = process.env.PORT ? Number(process.env.PORT) : 4000;
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN ?? "http://localhost:5173";
const SESSION_SECRET = process.env.SESSION_SECRET ?? "dev-secret-change-me";
const NODE_ENV = process.env.NODE_ENV ?? "development";

// Initialize Express & HTTP Server
const app = express();
const httpServer = createServer(app);

// Trust proxy if behind Nginx / Load Balancer (important for secure cookies in production)
if (NODE_ENV === "production") {
  app.set("trust proxy", 1);
}

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
    cookie: {
      httpOnly: true,
      sameSite: NODE_ENV === "production" ? "none" : "lax",
      secure: NODE_ENV === "production", // Requires HTTPS in production
    },
  })
);

// --- API ROUTES ---
app.use("/api/auth", authRouter);
app.use("/api/sessions", sessionsRouter);
app.use("/api/veranstaltungen", veranstaltungenRouter);
app.use("/api/umfragen", umfragenRouter);
app.use("/api/questions", questionsRouter);
app.use("/api/comments", commentsRouter);

// Profile mock (prevents 404 errors from determineAuthorName in frontend)
app.get("/api/profile", (_req, res) => {
  res.json({ name: "Teilnehmer", anonym: false });
});

// Simple healthcheck, prüft auch die DB-Verbindung
app.get("/api/health", async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.status(200).json({ status: "ok", db: "connected" });
  } catch (err) {
    console.error("Healthcheck database error:", err);
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