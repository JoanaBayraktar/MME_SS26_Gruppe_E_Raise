import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { Alert, BackButton, Button, Card, Field, Input } from "../components/ui";
import { postJson } from "../lib/api";
import { ROUTES } from "../routes";

const newVeranstaltungSchema = z.object({
  name: z.string().trim().min(1, "Bitte gib einen Namen ein."),
  kuerzel: z.string().trim().min(1, "Bitte gib ein Kürzel ein."),
});

type NewVeranstaltungFormValues = z.infer<typeof newVeranstaltungSchema>;

export default function NewVeranstaltungPage() {
  const navigate = useNavigate();
  const [serverError, setServerError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<NewVeranstaltungFormValues>({ resolver: zodResolver(newVeranstaltungSchema) });

  const onSubmit = async (values: NewVeranstaltungFormValues) => {
    setServerError(null);
    try {
      await postJson("/api/veranstaltungen", values);
      navigate(ROUTES.DOZENT_DASHBOARD);
    } catch (err) {
      setServerError(err instanceof Error ? err.message : "Veranstaltung konnte nicht angelegt werden.");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-white px-6">
      <div className="w-full max-w-xs">
        <BackButton onClick={() => navigate(ROUTES.DOZENT_DASHBOARD)} className="mb-6" />

        <div className="text-center">
          <h1 className="text-2xl font-bold text-brand">Neue Veranstaltung</h1>
          <p className="mt-2 text-gray-600">Organisiere deine Vorlesungsreihe.</p>
        </div>

        <Card className="mt-8 text-left">
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
            {serverError && <Alert tone="error">{serverError}</Alert>}

            <Field label="Name" htmlFor="name" error={errors.name?.message}>
              <Input id="name" placeholder="z. B. Multimedia Engineering" {...register("name")} />
            </Field>

            <Field label="Kürzel" htmlFor="kuerzel" error={errors.kuerzel?.message}>
              <Input id="kuerzel" placeholder="z. B. MME_SS26" {...register("kuerzel")} />
            </Field>

            <div className="flex gap-3">
              <Button type="button" variant="outline" onClick={() => navigate(ROUTES.DOZENT_DASHBOARD)}>
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
