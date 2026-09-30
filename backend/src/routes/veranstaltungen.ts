import { Router } from "express";
import { z } from "zod";
import { prisma } from "../prisma";

const createVeranstaltungSchema = z.object({
  name: z.string().trim().min(1, "Bitte gib einen Namen ein."),
  kuerzel: z.string().trim().min(1, "Bitte gib ein Kürzel ein."),
});

const addDozentSchema = z.object({
  kennung: z
    .string()
    .trim()
    .min(1, "Bitte gib eine Dozenten-Kennung oder E-Mail ein."),
});

export const veranstaltungenRouter = Router();

// Status der Veranstaltung ergibt sich aus ihren Sessions: läuft gerade eine,
// zählt die ganze Veranstaltung als "läuft"; sonst "geplant", solange noch
// etwas ansteht; erst wenn alle Sessions beendet sind, ist sie "beendet".
function computeVeranstaltungStatus(
  sessions: { status: string }[],
): "LAUFEND" | "GEPLANT" | "BEENDET" {
  if (sessions.some((s) => s.status === "LAUFEND")) return "LAUFEND";
  if (sessions.length === 0 || sessions.some((s) => s.status === "GEPLANT"))
    return "GEPLANT";
  return "BEENDET";
}

veranstaltungenRouter.get("/:id/dozenten", async (req, res) => {
  if (!req.session.dozentId) {
    return res
      .status(401)
      .json({ message: "Bitte melde dich als Dozent:in an." });
  }

  const id = Number(req.params.id);

  const veranstaltung = await prisma.veranstaltung.findFirst({
    where: {
      id,
      OR: [
        { dozentId: req.session.dozentId },
        { mitDozenten: { some: { dozentId: req.session.dozentId } } },
      ],
    },
    include: {
      dozent: true,
      mitDozenten: {
        include: {
          dozent: true,
        },
      },
    },
  });

  if (!veranstaltung) {
    return res
      .status(404)
      .json({ message: "Diese Veranstaltung existiert nicht." });
  }

  res.json([
    {
      id: veranstaltung.dozent.id,
      vorname: veranstaltung.dozent.vorname,
      nachname: veranstaltung.dozent.nachname,
      email: veranstaltung.dozent.email,
      istErsteller: true,
    },
    ...veranstaltung.mitDozenten.map((verknuepfung) => ({
      id: verknuepfung.dozent.id,
      vorname: verknuepfung.dozent.vorname,
      nachname: verknuepfung.dozent.nachname,
      email: verknuepfung.dozent.email,
      istErsteller: false,
    })),
  ]);
});

veranstaltungenRouter.post("/:id/dozenten", async (req, res) => {
  if (!req.session.dozentId) {
    return res
      .status(401)
      .json({ message: "Bitte melde dich als Dozent:in an." });
  }

  const id = Number(req.params.id);

  const parsed = addDozentSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({
      message: parsed.error.issues[0].message,
    });
  }

  const veranstaltung = await prisma.veranstaltung.findFirst({
    where: {
      id,
      dozentId: req.session.dozentId,
    },
  });

  if (!veranstaltung) {
    return res.status(404).json({
      message:
        "Diese Veranstaltung existiert nicht oder du bist nicht der Ersteller.",
    });
  }

  const kennung = parsed.data.kennung;
  const dozentId = Number(kennung);

  const dozent =
    Number.isInteger(dozentId) && dozentId > 0
      ? await prisma.dozent.findUnique({
          where: { id: dozentId },
        })
      : await prisma.dozent.findUnique({
          where: { email: kennung },
        });

  if (!dozent) {
    return res.status(404).json({
      message: "Kein Dozenten-Profil mit dieser Kennung oder E-Mail gefunden.",
    });
  }

  if (dozent.id === req.session.dozentId) {
    return res.status(400).json({
      message: "Du bist bereits Ersteller:in dieser Veranstaltung.",
    });
  }

  const bestehendeVerknuepfung = await prisma.veranstaltungDozent.findUnique({
    where: {
      veranstaltungId_dozentId: {
        veranstaltungId: id,
        dozentId: dozent.id,
      },
    },
  });

  if (bestehendeVerknuepfung) {
    return res.status(409).json({
      message: "Dieses Dozenten-Profil ist bereits verknüpft.",
    });
  }

  await prisma.veranstaltungDozent.create({
    data: {
      veranstaltungId: id,
      dozentId: dozent.id,
    },
  });

  res.status(201).json({
    id: dozent.id,
    vorname: dozent.vorname,
    nachname: dozent.nachname,
    email: dozent.email,
    istErsteller: false,
  });
});

veranstaltungenRouter.get("/", async (req, res) => {
  if (!req.session.dozentId) {
    return res
      .status(401)
      .json({ message: "Bitte melde dich als Dozent:in an." });
  }

  const veranstaltungen = await prisma.veranstaltung.findMany({
    // zeigt eigene und verknüpfte veranstaltungen im dashboard an
    where: {
      OR: [
        { dozentId: req.session.dozentId },
        { mitDozenten: { some: { dozentId: req.session.dozentId } } },
      ],
    },
    orderBy: { erstelltAm: "desc" },
    include: { sessions: { select: { status: true } } },
  });

  res.json(
    veranstaltungen.map((v) => ({
      id: v.id,
      name: v.name,
      kuerzel: v.kuerzel,
      sessionCount: v.sessions.length,
      status: computeVeranstaltungStatus(v.sessions),
    })),
  );
});

veranstaltungenRouter.get("/:id", async (req, res) => {
  if (!req.session.dozentId) {
    return res
      .status(401)
      .json({ message: "Bitte melde dich als Dozent:in an." });
  }

  const id = Number(req.params.id);
  const veranstaltung = await prisma.veranstaltung.findFirst({
    // erlaubt auch verknüpften dozent:innen den zugriff auf die veranstaltung
    where: {
      id,
      OR: [
        { dozentId: req.session.dozentId },
        { mitDozenten: { some: { dozentId: req.session.dozentId } } },
      ],
    },
    include: { sessions: { orderBy: { startZeit: "desc" } } },
  });

  if (!veranstaltung) {
    return res
      .status(404)
      .json({ message: "Diese Veranstaltung existiert nicht." });
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
    return res
      .status(401)
      .json({ message: "Bitte melde dich als Dozent:in an." });
  }

  const parsed = createVeranstaltungSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({
      message: parsed.error.issues[0].message,
    });
  }

  const bestehendeVeranstaltung = await prisma.veranstaltung.findFirst({
    where: {
      dozentId: req.session.dozentId,
      kuerzel: parsed.data.kuerzel,
    },
  });

  if (bestehendeVeranstaltung) {
    return res.status(409).json({
      message: "Dieses Kürzel wird bereits verwendet.",
    });
  }

  const veranstaltung = await prisma.veranstaltung.create({
    data: {
      ...parsed.data,
      dozentId: req.session.dozentId,
    },
  });

  res.status(201).json({
    id: veranstaltung.id,
    name: veranstaltung.name,
    kuerzel: veranstaltung.kuerzel,
  });

  veranstaltungenRouter.delete("/:id/dozenten/:dozentId", async (req, res) => {
    if (!req.session.dozentId) {
      return res.status(401).json({
        message: "Bitte melde dich als Dozent:in an.",
      });
    }

    const veranstaltungId = Number(req.params.id);
    const dozentId = Number(req.params.dozentId);

    const veranstaltung = await prisma.veranstaltung.findFirst({
      where: {
        id: veranstaltungId,
        dozentId: req.session.dozentId,
      },
    });

    if (!veranstaltung) {
      return res.status(404).json({
        message:
          "Diese Veranstaltung existiert nicht oder du bist nicht der Ersteller.",
      });
    }

    const verknuepfung = await prisma.veranstaltungDozent.findUnique({
      where: {
        veranstaltungId_dozentId: {
          veranstaltungId,
          dozentId,
        },
      },
    });

    if (!verknuepfung) {
      return res.status(404).json({
        message: "Diese Verknüpfung existiert nicht.",
      });
    }

    await prisma.veranstaltungDozent.delete({
      where: {
        veranstaltungId_dozentId: {
          veranstaltungId,
          dozentId,
        },
      },
    });

    res.status(204).end();
  });
});
