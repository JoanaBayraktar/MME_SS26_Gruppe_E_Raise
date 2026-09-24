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

const loginSchema = z.object({
  email: z.string().trim().email("Bitte gib eine gültige E-Mail-Adresse ein."),
  password: z.string().min(1, "Bitte gib dein Passwort ein."),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const navigate = useNavigate();
  const [serverError, setServerError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({ resolver: zodResolver(loginSchema) });

  const onSubmit = async (values: LoginFormValues) => {
    setServerError(null);
    try {
      const dozent = await postJson<DozentDto>("/api/auth/login", values);
      setStoredSession({ role: ROLE.DOZENT, name: `${dozent.vorname} ${dozent.nachname}` });
      navigate(ROUTES.DOZENT_DASHBOARD);
    } catch (err) {
      setServerError(err instanceof Error ? err.message : "Login fehlgeschlagen.");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-white px-6">
      <div className="w-full max-w-xs">
        <BackButton onClick={() => navigate(ROUTES.ONBOARDING)} className="mb-6" />

        <div className="text-center">
          <h1 className="text-2xl font-bold text-brand">Dozenten-Login</h1>
          <p className="mt-2 text-gray-600">Melde dich mit deinem Account an.</p>
        </div>

        <Card className="mt-8 text-left">
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
            {serverError && <Alert tone="error">{serverError}</Alert>}

            <Field label="E-Mail" htmlFor="email" error={errors.email?.message}>
              <Input id="email" type="email" placeholder="du@uni-regensburg.de" {...register("email")} />
            </Field>

            <Field label="Passwort" htmlFor="password" error={errors.password?.message}>
              <Input id="password" type="password" placeholder="••••••••" {...register("password")} />
            </Field>

            <Link to={ROUTES.FORGOT_PASSWORD} className="text-right text-xs text-brand underline">
              Passwort vergessen?
            </Link>

            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Wird geprüft..." : "Einloggen"}
            </Button>
          </form>
        </Card>

        <p className="mt-4 text-center text-sm text-gray-500">
          Noch keinen Account?{" "}
          <Link to={ROUTES.REGISTER} className="text-brand underline">
            Registrieren
          </Link>
        </p>
      </div>
    </div>
  );
}
