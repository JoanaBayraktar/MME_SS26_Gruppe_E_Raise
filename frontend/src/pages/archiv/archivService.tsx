import { getJson } from "../../lib/api";

export interface ArchivedEntryDto {
  id: number;
  veranstaltungId: number;
  veranstaltungName: string;
  kapitel: string | null;
  folienNr: number | null;
  frageText: string;
  antwortText: string | null;
  erstelltAm: string;
}

/**
 * Ruft alle archivierten Einträge aus dem Backend ab.
 */
export async function fetchArchivedEntries(): Promise<ArchivedEntryDto[]> {
  try {
    const data = await getJson<ArchivedEntryDto[]>("/api/archiv");
    return data ?? [];
  } catch (error) {
    console.error("Fehler beim Laden des Archivs:", error);
    return [];
  }
}