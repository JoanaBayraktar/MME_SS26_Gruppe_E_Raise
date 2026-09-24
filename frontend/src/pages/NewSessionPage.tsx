import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { Alert, Button, Card, Field, Input, Switch } from "../components/ui";
import { CreatedSessionDto, getJson, postJson, SessionCodeDto, VeranstaltungDto } from "../lib/api";
import { ROUTES } from "../routes";

const newSessionSchema = z
  .object({
    veranstaltungId: z.string().min(1, "Bitte wähle eine Veranstaltung."),
    name: z.string().trim().min(1, "Bitte gib einen Sitzungsnamen ein."),
    tag: z.string().min(1, "Bitte wähle ein Datum."),
    von: z.string().min(1, "Bitte wähle eine Startzeit."),
    bis: z.string().min(1, "Bitte wähle eine Endzeit."),
  })
  .refine((values) => values.bis > values.von, {
    message: "Das Ende muss nach dem Start liegen.",
    path: ["bis"],
  });

type NewSessionFormValues = z.infer<typeof newSessionSchema>;

type VeranstaltungenLoadState = "loading" | "loaded" | "empty" | "error";
type CodeLoadState = "loading" | "loaded" | "error";

export default function NewSessionPage() {
  const navigate = useNavigate();
  const [veranstaltungen, setVeranstaltungen] = useState<VeranstaltungDto[]>([]);
  const [veranstaltungenState, setVeranstaltungenState] = useState<VeranstaltungenLoadState>("loading");
  const [autoStart, setAutoStart] = useState(true);
  const [code, setCode] = useState<string | null>(null);
  const [codeState, setCodeState] = useState<CodeLoadState>("loading");
  const [serverError, setServerError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<NewSessionFormValues>({
    resolver: zodResolver(newSessionSchema),
    defaultValues: { veranstaltungId: "", name: "", tag: "", von: "", bis: "" },
  });
  const selectedVeranstaltungId = watch("veranstaltungId");

  useEffect(() => {
    getJson<VeranstaltungDto[]>("/api/veranstaltungen")
      .then((data) => {
        setVeranstaltungen(data);
        setVeranstaltungenState(data.length === 0 ? "empty" : "loaded");
      })
      .catch(() => setVeranstaltungenState("error"));
  }, []);

  const loadCode = () => {
    setCodeState("loading");
    getJson<SessionCodeDto>("/api/sessions/code")
      .then((data) => {
        setCode(data.code);
        setCodeState("loaded");
      })
      .catch(() => setCodeState("error"));
  };

  useEffect(loadCode, []);

  const close = () => navigate(ROUTES.DOZENT_SESSIONS);

  const onSubmit = async (values: NewSessionFormValues) => {
    setServerError(null);
    try {
      await postJson<CreatedSessionDto>("/api/sessions", {
        veranstaltungId: Number(values.veranstaltungId),
        name: values.name,
        startZeit: new Date(`${values.tag}T${values.von}`).toISOString(),
        endZeit: new Date(`${values.tag}T${values.bis}`).toISOString(),
        autoStart,
        code: code ?? undefined,
      });
      close();
    } catch (err) {
      setServerError(err instanceof Error ? err.message : "Session konnte nicht angelegt werden.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-gray-900/40 p-6" onClick={close}>
      <Card className="w-full max-w-lg p-8" onClick={(event) => event.stopPropagation()}>
        <h1 className="text-xl font-bold text-gray-900">Neue Session</h1>
        <p className="mt-1 text-sm text-gray-500">Bereite eine neue Vorlesungsstunde vor.</p>

        {veranstaltungenState === "empty" && (
          <Alert tone="error" className="mt-6">
            Du hast noch keine Veranstaltung angelegt. Lege zuerst eine Veranstaltung an.
          </Alert>
        )}

        {veranstaltungenState === "error" && (
          <Alert tone="error" className="mt-6">
            Konnte Veranstaltungen nicht laden.
          </Alert>
        )}

        {veranstaltungenState === "loaded" && (
          <form onSubmit={handleSubmit(onSubmit)} className="mt-6 flex flex-col gap-5">
            {serverError && <Alert tone="error">{serverError}</Alert>}

            <Field label="Name der Session" htmlFor="name" error={errors.name?.message}>
              <Input id="name" placeholder="z. B. Session 3 · Prototyping" {...register("name")} />
            </Field>

            <div>
              <p className="mb-1 block text-sm font-medium text-gray-700">Veranstaltung auswählen</p>
              <div className="flex flex-wrap gap-2">
                {veranstaltungen.map((veranstaltung) => (
                  <button
                    key={veranstaltung.id}
                    type="button"
                    onClick={() =>
                      setValue("veranstaltungId", String(veranstaltung.id), { shouldValidate: true })
                    }
                    className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                      selectedVeranstaltungId === String(veranstaltung.id)
                        ? "border-brand bg-brand-light text-brand"
                        : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
                    }`}
                  >
                    {veranstaltung.name}
                  </button>
                ))}
              </div>
              {errors.veranstaltungId && (
                <p className="mt-1 text-xs text-red-600">{errors.veranstaltungId.message}</p>
              )}
            </div>

            <div className="grid grid-cols-3 gap-3">
              <Field label="Tag" htmlFor="tag" error={errors.tag?.message}>
                <Input id="tag" type="date" {...register("tag")} />
              </Field>
              <Field label="Von" htmlFor="von" error={errors.von?.message}>
                <Input id="von" type="time" {...register("von")} />
              </Field>
              <Field label="Bis" htmlFor="bis" error={errors.bis?.message}>
                <Input id="bis" type="time" {...register("bis")} />
              </Field>
            </div>

            <div className="flex flex-col gap-2">
              <label className="flex items-center justify-between gap-4 rounded-xl border border-gray-100 px-4 py-3">
                <span>
                  <span className="block text-sm font-semibold text-gray-900">
                    Automatisch starten &amp; beenden
                  </span>
                  <span className="text-xs text-gray-500">Session läuft im angegebenen Zeitraum von selbst</span>
                </span>
                <Switch checked={autoStart} onChange={() => setAutoStart(true)} />
              </label>
              <label className="flex items-center justify-between gap-4 rounded-xl border border-gray-100 px-4 py-3">
                <span>
                  <span className="block text-sm font-semibold text-gray-900">Manueller Start</span>
                  <span className="text-xs text-gray-500">Du startest die Session selbst</span>
                </span>
                <Switch checked={!autoStart} onChange={() => setAutoStart(false)} />
              </label>
            </div>

            <div className="flex items-center justify-between rounded-xl bg-gray-50 px-4 py-3">
              <span>
                <span className="block text-xs font-medium uppercase tracking-wide text-gray-400">
                  Session-Code
                </span>
                <span className="text-2xl font-bold tracking-widest text-brand">
                  {codeState === "loaded" ? code : "..."}
                </span>
              </span>
              <button
                type="button"
                onClick={loadCode}
                disabled={codeState === "loading"}
                className="text-sm font-semibold text-brand hover:underline disabled:opacity-50"
              >
                Neu generieren
              </button>
            </div>

            <div className="flex gap-3">
              <Button type="submit" disabled={isSubmitting || codeState !== "loaded"}>
                {isSubmitting ? "Wird angelegt..." : "Speichern"}
              </Button>
              <Button type="button" variant="outline" onClick={close}>
                Abbrechen
              </Button>
            </div>
          </form>
        )}
      </Card>
    </div>
  );
}
