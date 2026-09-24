export interface DozentDto {
  id: number;
  vorname: string;
  nachname: string;
  email: string;
}

export interface VeranstaltungDto {
  id: number;
  name: string;
  kuerzel: string;
}

export interface VeranstaltungSummaryDto extends VeranstaltungDto {
  sessionCount: number;
  status: "GEPLANT" | "LAUFEND" | "BEENDET";
}

export interface ActiveSessionDto {
  id: number;
  name: string;
  code: string;
  startZeit: string;
  veranstaltungName: string;
}

export interface SessionSummaryDto {
  id: number;
  name: string;
  code: string;
  status: "GEPLANT" | "LAUFEND" | "BEENDET";
  veranstaltungName: string;
}

export interface CreatedSessionDto {
  id: number;
  name: string;
  code: string;
  status: "GEPLANT" | "LAUFEND" | "BEENDET";
}

export interface SessionCodeDto {
  code: string;
}

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

export function isUnauthorized(error: unknown): boolean {
  return error instanceof ApiError && error.status === 401;
}

export async function getJson<T>(path: string): Promise<T> {
  const res = await fetch(path, { credentials: "include" });
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    throw new ApiError(data?.message ?? "Etwas ist schiefgelaufen.", res.status);
  }
  return data as T;
}

export async function postJson<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    throw new ApiError(data?.message ?? "Etwas ist schiefgelaufen.", res.status);
  }
  return data as T;
}
