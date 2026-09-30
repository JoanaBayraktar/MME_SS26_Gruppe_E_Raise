import { BadgeTone } from "../components/ui";

export type SessionStatus = "GEPLANT" | "LAUFEND" | "BEENDET";

export const SESSION_STATUS_LABEL: Record<SessionStatus, string> = {
  GEPLANT: "geplant",
  LAUFEND: "läuft",
  BEENDET: "beendet",
};

export const SESSION_STATUS_TONE: Record<SessionStatus, BadgeTone> = {
  GEPLANT: "neutral",
  LAUFEND: "brand",
  BEENDET: "muted",
};
