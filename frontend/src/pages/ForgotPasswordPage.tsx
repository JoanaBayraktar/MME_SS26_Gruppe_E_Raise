import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { Alert, BackButton, Button, Card, Field, Input } from "../components/ui";
import { ROUTES } from "../routes";

const forgotPasswordSchema = z.object({
  email: z.string().trim().email("Bitte gib eine gültige E-Mail-Adresse ein."),
});

type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [submitted, setSubmitted] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormValues>({ resolver: zodResolver(forgotPasswordSchema) });

  return (
    <div className="flex min-h-screen items-center justify-center bg-white px-6">
      <div className="w-full max-w-xs">
        <BackButton onClick={() => navigate(ROUTES.LOGIN)} className="mb-6" />

        <div className="text-center">
          <h1 className="text-2xl font-bold text-brand">Passwort vergessen</h1>
          <p className="mt-2 text-gray-600">Gib deine E-Mail-Adresse ein.</p>
        </div>

        <Card className="mt-8 text-left">
          {submitted ? (
            <Alert tone="success">
              Falls zu dieser E-Mail-Adresse ein Account existiert, erhältst du in Kürze eine Nachricht mit
              weiteren Schritten.
            </Alert>
          ) : (
            <form onSubmit={handleSubmit(() => setSubmitted(true))} className="flex flex-col gap-4">
              <Field label="E-Mail" htmlFor="email" error={errors.email?.message}>
                <Input id="email" type="email" placeholder="du@uni-regensburg.de" {...register("email")} />
              </Field>

              <Button type="submit">Link anfordern</Button>
            </form>
          )}
        </Card>
      </div>
    </div>
  );
}
