import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { Alert, BackButton, Button, Card, Field, Input, Select } from "../components/ui";
import { getJson, postJson, VeranstaltungDto } from "../lib/api";
import { ROUTES } from "../routes";

const newSessionSchema = z.object({
  veranstaltungId: z.string().min(1, "Bitte wähle eine Veranstaltung."),
  name: z.string().trim().min(1, "Bitte gib einen Sitzungsnamen ein."),
  startZeit: z.string().min(1, "Bitte wähle Datum und Uhrzeit."),
});

type NewSessionFormValues = z.infer<typeof newSessionSchema>;

interface CreatedSession {
  id: number;
  name: string;
  code: string;
}

type VeranstaltungenLoadState = "loading" | "loaded" | "empty" | "error";

export default function NewSessionPage() {
  const navigate = useNavigate();
  const [veranstaltungen, setVeranstaltungen] = useState<VeranstaltungDto[]>([]);
  const [veranstaltungenState, setVeranstaltungenState] = useState<VeranstaltungenLoadState>("loading");
  const [serverError, setServerError] = useState<string | null>(null);
  const [createdSession, setCreatedSession] = useState<CreatedSession | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<NewSessionFormValues>({ resolver: zodResolver(newSessionSchema) });

  useEffect(() => {
    getJson<VeranstaltungDto[]>("/api/veranstaltungen")
      .then((data) => {
        setVeranstaltungen(data);
        setVeranstaltungenState(data.length === 0 ? "empty" : "loaded");
      })
      .catch(() => setVeranstaltungenState("error"));
  }, []);

  const onSubmit = async (values: NewSessionFormValues) => {
    setServerError(null);
    try {
      const session = await postJson<CreatedSession>("/api/sessions", {
        veranstaltungId: Number(values.veranstaltungId),
        name: values.name,
        startZeit: new Date(values.startZeit).toISOString(),
      });
      setCreatedSession(session);
    } catch (err) {
      setServerError(err instanceof Error ? err.message : "Session konnte nicht angelegt werden.");
    }
  };

  if (createdSession) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white px-6">
        <div className="w-full max-w-xs text-center">
          <Card>
            <Alert tone="success">Session "{createdSession.name}" wurde angelegt.</Alert>
            <p className="mt-4 text-sm text-gray-500">Beitritts-Code für deine Studierenden:</p>
            <p className="mt-1 text-3xl font-bold tracking-widest text-brand">{createdSession.code}</p>
          </Card>
          <Button className="mt-4" onClick={() => navigate(ROUTES.DOZENT_SESSIONS)}>
            Fertig
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-white px-6">
      <div className="w-full max-w-xs">
        <BackButton onClick={() => navigate(ROUTES.DOZENT_SESSIONS)} className="mb-6" />

        <div className="text-center">
          <h1 className="text-2xl font-bold text-brand">Neue Session</h1>
          <p className="mt-2 text-gray-600">Bereite eine neue Vorlesungsstunde vor.</p>
        </div>

        <Card className="mt-8 text-left">
          {veranstaltungenState === "empty" && (
            <Alert tone="error">
              Du hast noch keine Veranstaltung angelegt. Lege zuerst eine Veranstaltung an.
            </Alert>
          )}

          {veranstaltungenState === "error" && <Alert tone="error">Konnte Veranstaltungen nicht laden.</Alert>}

          {veranstaltungenState === "loaded" && (
            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
              {serverError && <Alert tone="error">{serverError}</Alert>}

              <Field label="Veranstaltung" htmlFor="veranstaltungId" error={errors.veranstaltungId?.message}>
                <Select id="veranstaltungId" defaultValue="" {...register("veranstaltungId")}>
                  <option value="" disabled>
                    Bitte wählen
                  </option>
                  {veranstaltungen.map((veranstaltung) => (
                    <option key={veranstaltung.id} value={veranstaltung.id}>
                      {veranstaltung.name} ({veranstaltung.kuerzel})
                    </option>
                  ))}
                </Select>
              </Field>

              <Field label="Sitzungsname" htmlFor="name" error={errors.name?.message}>
                <Input id="name" placeholder="z. B. Session 4" {...register("name")} />
              </Field>

              <Field label="Datum & Uhrzeit" htmlFor="startZeit" error={errors.startZeit?.message}>
                <Input id="startZeit" type="datetime-local" {...register("startZeit")} />
              </Field>

              <div className="flex gap-3">
                <Button type="button" variant="outline" onClick={() => navigate(ROUTES.DOZENT_SESSIONS)}>
                  Abbrechen
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Wird angelegt..." : "Speichern"}
                </Button>
              </div>
            </form>
          )}
        </Card>
      </div>
    </div>
  );
}
