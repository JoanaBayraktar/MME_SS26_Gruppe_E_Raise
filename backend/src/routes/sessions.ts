import { Router } from "express";
import { prisma } from "../prisma";

export const sessionsRouter = Router();

sessionsRouter.get("/by-code/:code", async (req, res) => {
  const code = req.params.code.trim().toUpperCase();
  const session = await prisma.session.findUnique({ where: { code } });

  if (!session || session.status === "BEENDET") {
    return res.status(404).json({ message: "Diese Session existiert nicht oder ist beendet." });
  }

  res.json({ id: session.id, name: session.name, status: session.status });
});
