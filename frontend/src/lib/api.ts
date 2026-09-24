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

export async function getJson<T>(path: string): Promise<T> {
  const res = await fetch(path, { credentials: "include" });
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    throw new Error(data?.message ?? "Etwas ist schiefgelaufen.");
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
    throw new Error(data?.message ?? "Etwas ist schiefgelaufen.");
  }
  return data as T;
}
