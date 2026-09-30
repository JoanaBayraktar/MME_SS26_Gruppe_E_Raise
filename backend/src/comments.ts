import { Router } from "express";
import { prisma } from "./prisma";

const router = Router();

// Vote für einen spezifischen Kommentar umschalten
router.post("/:id/vote", async (req, res) => {
  try {
    const { id } = req.params;
    const { studentToken } = req.body;
    const commentId = Number(id);

    if (!studentToken) {
      return res.status(400).json({ error: "StudentToken ist erforderlich." });
    }

    // Prüfen, ob bereits ein Upvote für diesen Kommentar existiert
    // Hinweis: Falls du eine separate Upvote-Tabelle für Kommentare in deiner prisma.schema hast, passe dies an.
    // Hier nutzen wir einen simulierten oder standardmäßigen Ansatz, falls die Relation existiert.
    const existingUpvote = await prisma.kommentarUpvote.findFirst({
      where: {
        kommentarId: commentId,
        studentToken: String(studentToken),
      },
    });

    if (existingUpvote) {
      await prisma.kommentarUpvote.delete({
        where: { id: existingUpvote.id },
      });
    } else {
      await prisma.kommentarUpvote.create({
        data: {
          kommentarId: commentId,
          studentToken: String(studentToken),
        },
      });
    }

    const updatedComment = await prisma.kommentar.findUnique({
      where: { id: commentId },
      include: { upvotes: true },
    });

    if (!updatedComment) {
      return res.status(404).json({ error: "Kommentar nicht gefunden." });
    }

    const hasVoted = updatedComment.upvotes.some((u: any) => u.studentToken === studentToken);

    return res.json({
      id: updatedComment.id,
      votes: updatedComment.upvotes.length,
      voted: hasVoted,
    });
  } catch (error) {
    console.error("Error toggling comment vote:", error);
    return res.status(500).json({ error: "Fehler beim Voten des Kommentars" });
  }
});

export default router;