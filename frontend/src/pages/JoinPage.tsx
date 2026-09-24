import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { BackButton, Button, Card, Checkbox, Field, Input } from "../components/ui";
import { ROLE } from "../lib/role";
import { setStoredSession } from "../lib/session";
import { ROUTES } from "../routes";

const CODE_LENGTH = 6;
const CODE_PATTERN = new RegExp(`^[A-Za-z0-9]{${CODE_LENGTH}}$`);

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
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<JoinFormValues>({
    resolver: zodResolver(joinSchema),
    defaultValues: { name: "", code: "", anonymous: true },
  });

  const onSubmit = (values: JoinFormValues) => {
    setStoredSession({
      role: ROLE.STUDENT,
      name: values.anonymous ? undefined : values.name,
      anonymous: values.anonymous,
      sessionCode: values.code.toUpperCase(),
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

            <Button type="submit">Beitreten</Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
