import { zodResolver } from "@hookform/resolvers/zod";
import { QrCode } from "lucide-react";
import { useForm } from "react-hook-form";
import { useLocation, useNavigate } from "react-router-dom";
import { z } from "zod";
import { BackButton, Button, Card, Checkbox, Field, Input } from "../components/ui";
import { getJson } from "../lib/api";
import { ROLE } from "../lib/role";
import { setStoredSession } from "../lib/session";
import { ROUTES } from "../routes";

const CODE_LENGTH = 6;
const CODE_PATTERN = new RegExp(`^[A-Za-z0-9]{${CODE_LENGTH}}$`);
const CODE_NOT_FOUND_MESSAGE = "Diesen Code gibt es nicht. Bitte prüfe deine Eingabe.";

const joinSchema = z.object({
  name: z.string().trim().min(1, "Bitte gib deinen Namen ein."),
  code: z
    .string()
    .trim()
    .regex(CODE_PATTERN, `Der Code besteht aus ${CODE_LENGTH} Buchstaben/Zahlen.`),
  anonymous: z.boolean(),
});

type JoinFormValues = z.infer<typeof joinSchema>;

export default function JoinPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const scannedCode = (location.state as { scannedCode?: string } | null)?.scannedCode ?? "";
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<JoinFormValues>({
    resolver: zodResolver(joinSchema),
    defaultValues: { name: "", code: scannedCode, anonymous: true },
  });

  const onSubmit = async (values: JoinFormValues) => {
    const code = values.code.toUpperCase();

    try {
      await getJson(`/api/sessions/by-code/${code}`);
    } catch {
      setError("code", { message: CODE_NOT_FOUND_MESSAGE });
      return;
    }

    setStoredSession({
      role: ROLE.STUDENT,
      name: values.anonymous ? undefined : values.name,
      anonymous: values.anonymous,
      sessionCode: code,
    });
    navigate(ROUTES.SESSION);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-white px-6">
      <div className="w-full max-w-xs">
        <BackButton onClick={() => navigate(ROUTES.ONBOARDING)} className="mb-6" />

        <div className="text-center">
          <h1 className="text-2xl font-bold text-brand">Session beitreten</h1>
          <p className="mt-2 text-gray-600">Gib deinen Namen und den Code der Veranstaltung ein.</p>
        </div>

        <Card className="mt-8 text-left">
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <Field label="Wie ist dein Name?" htmlFor="name" error={errors.name?.message}>
              <Input id="name" placeholder="z. B. Lisa" {...register("name")} />
            </Field>

            <Field label="Code eingeben" htmlFor="code" error={errors.code?.message}>
              <Input id="code" placeholder="z. B. AB12CD" className="uppercase" {...register("code")} />
            </Field>

            <Checkbox label="Anonym teilnehmen" defaultChecked {...register("anonymous")} />

            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Wird geprüft..." : "Beitreten"}
            </Button>
          </form>
        </Card>

        <button
          type="button"
          onClick={() => navigate(ROUTES.JOIN_QR)}
          className="mt-4 flex w-full items-center justify-center gap-2 text-sm font-medium text-gray-500 hover:text-brand"
        >
          <QrCode className="h-4 w-4" />
          QR-Code scannen
        </button>
      </div>
    </div>
  );
}
