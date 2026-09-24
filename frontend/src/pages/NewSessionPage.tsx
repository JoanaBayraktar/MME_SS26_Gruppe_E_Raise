import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useLocation, useNavigate } from "react-router-dom";
import { z } from "zod";
import { Alert, BackButton, Button, Card, Field, Input } from "../components/ui";
import { postJson } from "../lib/api";
import { buildVeranstaltungDetailPath, ROUTES } from "../routes";

const newSessionSchema = z.object({
  name: z.string().trim().min(1, "Bitte gib einen Sitzungsnamen ein."),
  startZeit: z.string().min(1, "Bitte wähle Datum und Uhrzeit."),
});

type NewSessionFormValues = z.infer<typeof newSessionSchema>;

interface CreatedSession {
  id: number;
  name: string;
  code: string;
}

export default function NewSessionPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const veranstaltungId = (location.state as { veranstaltungId?: number } | null)?.veranstaltungId;
  const backTarget = veranstaltungId ? buildVeranstaltungDetailPath(veranstaltungId) : ROUTES.DOZENT_DASHBOARD;

  const [serverError, setServerError] = useState<string | null>(null);
  const [createdSession, setCreatedSession] = useState<CreatedSession | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<NewSessionFormValues>({ resolver: zodResolver(newSessionSchema) });

  if (!veranstaltungId) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white px-6">
        <div className="w-full max-w-xs">
          <BackButton onClick={() => navigate(ROUTES.DOZENT_DASHBOARD)} className="mb-6" />
          <Card className="text-center">
            <Alert tone="error">
              Bitte wähle zuerst eine Veranstaltung aus, für die du eine Session anlegen willst.
            </Alert>
          </Card>
        </div>
      </div>
    );
  }

  const onSubmit = async (values: NewSessionFormValues) => {
    setServerError(null);
    try {
      const session = await postJson<CreatedSession>("/api/sessions", {
        veranstaltungId,
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
          <Button className="mt-4" onClick={() => navigate(backTarget)}>
            Fertig
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-white px-6">
      <div className="w-full max-w-xs">
        <BackButton onClick={() => navigate(backTarget)} className="mb-6" />

        <div className="text-center">
          <h1 className="text-2xl font-bold text-brand">Neue Session</h1>
          <p className="mt-2 text-gray-600">Bereite eine neue Vorlesungsstunde vor.</p>
        </div>

        <Card className="mt-8 text-left">
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
            {serverError && <Alert tone="error">{serverError}</Alert>}

            <Field label="Sitzungsname" htmlFor="name" error={errors.name?.message}>
              <Input id="name" placeholder="z. B. Session 4" {...register("name")} />
            </Field>

            <Field label="Datum & Uhrzeit" htmlFor="startZeit" error={errors.startZeit?.message}>
              <Input id="startZeit" type="datetime-local" {...register("startZeit")} />
            </Field>

            <div className="flex gap-3">
              <Button type="button" variant="outline" onClick={() => navigate(backTarget)}>
                Abbrechen
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Wird angelegt..." : "Speichern"}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}
