import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { z } from "zod";
import { Alert, BackButton, Button, Card, Field, Input } from "../components/ui";
import { DozentDto, postJson } from "../lib/api";
import { ROLE } from "../lib/role";
import { setStoredSession } from "../lib/session";
import { ROUTES } from "../routes";

const PASSWORD_MIN_LENGTH = 8;

const registerSchema = z.object({
  vorname: z.string().trim().min(1, "Bitte gib deinen Vornamen ein."),
  nachname: z.string().trim().min(1, "Bitte gib deinen Nachnamen ein."),
  email: z.string().trim().email("Bitte gib eine gültige E-Mail-Adresse ein."),
  password: z.string().min(PASSWORD_MIN_LENGTH, `Das Passwort muss mindestens ${PASSWORD_MIN_LENGTH} Zeichen haben.`),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const navigate = useNavigate();
  const [serverError, setServerError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({ resolver: zodResolver(registerSchema) });

  const onSubmit = async (values: RegisterFormValues) => {
    setServerError(null);
    try {
      const dozent = await postJson<DozentDto>("/api/auth/register", values);
      setStoredSession({ role: ROLE.DOZENT, name: `${dozent.vorname} ${dozent.nachname}` });
      navigate(ROUTES.DOZENT_DASHBOARD);
    } catch (err) {
      setServerError(err instanceof Error ? err.message : "Registrierung fehlgeschlagen.");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-white px-6">
      <div className="w-full max-w-xs">
        <BackButton onClick={() => navigate(ROUTES.LOGIN)} className="mb-6" />

        <div className="text-center">
          <h1 className="text-2xl font-bold text-brand">Account erstellen</h1>
          <p className="mt-2 text-gray-600">Registriere dich als Dozent:in.</p>
        </div>

        <Card className="mt-8 text-left">
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
            {serverError && <Alert tone="error">{serverError}</Alert>}

            <Field label="Vorname" htmlFor="vorname" error={errors.vorname?.message}>
              <Input id="vorname" placeholder="z. B. Nils" {...register("vorname")} />
            </Field>

            <Field label="Nachname" htmlFor="nachname" error={errors.nachname?.message}>
              <Input id="nachname" placeholder="z. B. Hellwig" {...register("nachname")} />
            </Field>

            <Field label="E-Mail" htmlFor="email" error={errors.email?.message}>
              <Input id="email" type="email" placeholder="du@uni-regensburg.de" {...register("email")} />
            </Field>

            <Field label="Passwort" htmlFor="password" error={errors.password?.message}>
              <Input id="password" type="password" placeholder="••••••••" {...register("password")} />
            </Field>

            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Wird erstellt..." : "Account erstellen"}
            </Button>
          </form>
        </Card>

        <p className="mt-4 text-center text-sm text-gray-500">
          Schon registriert?{" "}
          <Link to={ROUTES.LOGIN} className="text-brand underline">
            Einloggen
          </Link>
        </p>
      </div>
    </div>
  );
}
