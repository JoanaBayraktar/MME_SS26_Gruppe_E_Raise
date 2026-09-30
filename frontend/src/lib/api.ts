export interface DozentDto {
  id: number;
  vorname: string;
  nachname: string;
  email: string;
}

export interface VerknuepfterDozentDto extends DozentDto {
  istErsteller: boolean;
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

export interface SessionByCodeDto {
  id: number;
  name: string;
  code: string;
  status: "GEPLANT" | "LAUFEND" | "BEENDET";
  veranstaltungName: string;
}

export interface ActiveUmfrageDto {
  id: number;
  frageText: string;
  typ: "SINGLE_CHOICE" | "MULTIPLE_CHOICE" | "SKALA";
  status: "AKTIV";
  antwortoptionen: {
    id: number;
    text: string;
  }[];
}

export interface SessionSummaryDto {
  id: number;
  name: string;
  code: string;
  status: "GEPLANT" | "LAUFEND" | "BEENDET";
  datum: string;
  veranstaltungId: number;
  veranstaltungName: string;
}

export interface SessionDetailDto {
  id: number;
  name: string;
  code: string;
  status: "GEPLANT" | "LAUFEND" | "BEENDET";
  autoStart: boolean;
  datum: string;
  startZeit: string;
  endZeit: string | null;
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

// löscht eine verknüpfung über die api
export async function deleteJson(path: string): Promise<void> {
  const res = await fetch(path, {
    method: "DELETE",
    credentials: "include",
  });

  if (!res.ok) {
    const data = await res.json().catch(() => null);
    throw new ApiError(
      data?.message ?? "Etwas ist schiefgelaufen.",
      res.status,
    );
  }
}
export async function patchJson<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(path, {
    method: "PATCH",
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

export async function deleteRequest(path: string): Promise<void> {
  const res = await fetch(path, { method: "DELETE", credentials: "include" });
  if (!res.ok) {
    const data = await res.json().catch(() => null);
    throw new ApiError(data?.message ?? "Etwas ist schiefgelaufen.", res.status);
  }
}
