import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { Alert, Button, Card, DashboardLayout, Field, Input, Modal } from "../components/ui";
import {
  ApiError,
  deleteRequest,
  DozentDto,
  getJson,
  isUnauthorized,
  patchJson,
  postJson,
} from "../lib/api";
import { DOZENT_NAV_ITEMS } from "../lib/dozentNav";
import { clearStoredSession, setStoredSession } from "../lib/session";
import { ROLE } from "../lib/role";
import { ROUTES } from "../routes";

const PASSWORD_MIN_LENGTH = 8;

const profileSchema = z
  .object({
    vorname: z.string().trim().min(1, "Bitte gib deinen Vornamen ein."),
    nachname: z.string().trim().min(1, "Bitte gib deinen Nachnamen ein."),
    email: z.string().trim().email("Bitte gib eine gültige E-Mail-Adresse ein."),
    currentPassword: z.string().optional(),
    newPassword: z.string().optional(),
  })
  .refine((values) => !values.newPassword || (values.currentPassword ?? "").length > 0, {
    message: "Bitte gib dein aktuelles Passwort ein, um ein neues zu setzen.",
    path: ["currentPassword"],
  })
  .refine((values) => !values.newPassword || values.newPassword.length >= PASSWORD_MIN_LENGTH, {
    message: `Das neue Passwort muss mindestens ${PASSWORD_MIN_LENGTH} Zeichen haben.`,
    path: ["newPassword"],
  });

type ProfileFormValues = z.infer<typeof profileSchema>;

type LoadState = "loading" | "loaded" | "error";
type ConfirmDialog = "none" | "logout" | "delete-1" | "delete-2";

export default function AccountPage() {
  const navigate = useNavigate();
  const [loadState, setLoadState] = useState<LoadState>("loading");
  const [dozent, setDozent] = useState<DozentDto | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState<ConfirmDialog>("none");
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ProfileFormValues>({ resolver: zodResolver(profileSchema) });

  useEffect(() => {
    getJson<DozentDto>("/api/auth/me")
      .then((dozentData) => {
        setDozent(dozentData);
        reset({ vorname: dozentData.vorname, nachname: dozentData.nachname, email: dozentData.email });
        setLoadState("loaded");
      })
      .catch((err) => {
        if (isUnauthorized(err)) {
          navigate(ROUTES.LOGIN);
          return;
        }
        setLoadState("error");
      });
  }, [navigate, reset]);

  const onSubmit = async (values: ProfileFormValues) => {
    setSaveError(null);
    setSaveSuccess(false);
    try {
      const updated = await patchJson<DozentDto>("/api/auth/me", {
        vorname: values.vorname,
        nachname: values.nachname,
        email: values.email,
        currentPassword: values.currentPassword || undefined,
        newPassword: values.newPassword || undefined,
      });
      setStoredSession({ role: ROLE.DOZENT, name: `${updated.vorname} ${updated.nachname}` });
      setDozent(updated);
      reset({ vorname: updated.vorname, nachname: updated.nachname, email: updated.email });
      setSaveSuccess(true);
    } catch (err) {
      setSaveError(err instanceof ApiError ? err.message : "Profil konnte nicht gespeichert werden.");
    }
  };

  const handleLogout = async () => {
    await postJson("/api/auth/logout", {});
    clearStoredSession();
    navigate(ROUTES.ONBOARDING);
  };

  const handleDelete = async () => {
    await deleteRequest("/api/auth/me");
    clearStoredSession();
    navigate(ROUTES.ONBOARDING);
  };

  return (
    <DashboardLayout
      navItems={DOZENT_NAV_ITEMS}
      activeNavKey="account"
      title="Account"
      userName={dozent ? `${dozent.vorname} ${dozent.nachname}` : ""}
    >
      {loadState === "error" && <Alert tone="error">Konnte Profil nicht laden.</Alert>}

      {loadState === "loaded" && (
        <div className="flex flex-col gap-4">
          <Card className="max-w-lg">
            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
              {saveError && <Alert tone="error">{saveError}</Alert>}
              {saveSuccess && <Alert tone="success">Profil wurde gespeichert.</Alert>}

              <Field label="Vorname" htmlFor="vorname" error={errors.vorname?.message}>
                <Input id="vorname" {...register("vorname")} />
              </Field>
              <Field label="Nachname" htmlFor="nachname" error={errors.nachname?.message}>
                <Input id="nachname" {...register("nachname")} />
              </Field>
              <Field label="E-Mail" htmlFor="email" error={errors.email?.message}>
                <Input id="email" type="email" {...register("email")} />
              </Field>
              <Field label="Aktuelles Passwort" htmlFor="currentPassword" error={errors.currentPassword?.message}>
                <Input id="currentPassword" type="password" {...register("currentPassword")} />
              </Field>
              <Field label="Neues Passwort" htmlFor="newPassword" error={errors.newPassword?.message}>
                <Input id="newPassword" type="password" {...register("newPassword")} />
              </Field>

              <Button type="submit" disabled={isSubmitting} className="w-auto px-4">
                {isSubmitting ? "Wird gespeichert..." : "Speichern"}
              </Button>
            </form>
          </Card>

          <Card className="flex max-w-lg items-center justify-between">
            <p className="text-sm text-gray-700">Von diesem Gerät abmelden.</p>
            <Button variant="outline" className="w-auto px-4" onClick={() => setConfirmDialog("logout")}>
              Logout
            </Button>
          </Card>

          <Card className="flex max-w-lg items-center justify-between border-red-100">
            <p className="text-sm text-gray-700">Account unwiderruflich löschen.</p>
            <Button variant="outline" className="w-auto px-4 !text-red-600" onClick={() => setConfirmDialog("delete-1")}>
              Account löschen
            </Button>
          </Card>
        </div>
      )}

      {confirmDialog === "logout" && (
        <Modal className="max-w-sm p-6" onClose={() => setConfirmDialog("none")}>
          {(close) => (
            <>
              <h2 className="text-lg font-bold text-gray-900">Abmelden?</h2>
              <p className="mt-2 text-sm text-gray-500">Du wirst von diesem Gerät abgemeldet.</p>
              <div className="mt-6 flex gap-3">
                <Button onClick={() => handleLogout().then(close)}>Bestätigen</Button>
                <Button variant="outline" onClick={close}>
                  Abbrechen
                </Button>
              </div>
            </>
          )}
        </Modal>
      )}

      {confirmDialog === "delete-1" && (
        <Modal className="max-w-sm p-6" onClose={() => setConfirmDialog("none")}>
          {(close) => (
            <>
              <h2 className="text-lg font-bold text-gray-900">Account löschen?</h2>
              <p className="mt-2 text-sm text-gray-500">
                Damit werden alle deine Veranstaltungen und Sessions unwiderruflich entfernt.
              </p>
              <div className="mt-6 flex gap-3">
                <Button className="!bg-red-600" onClick={() => setConfirmDialog("delete-2")}>
                  Weiter
                </Button>
                <Button variant="outline" onClick={close}>
                  Abbrechen
                </Button>
              </div>
            </>
          )}
        </Modal>
      )}

      {confirmDialog === "delete-2" && (
        <Modal className="max-w-sm p-6" onClose={() => setConfirmDialog("none")}>
          {(close) => (
            <>
              <h2 className="text-lg font-bold text-gray-900">Wirklich endgültig löschen?</h2>
              <p className="mt-2 text-sm text-gray-500">Das kann nicht rückgängig gemacht werden.</p>
              <div className="mt-6 flex gap-3">
                <Button className="!bg-red-600" onClick={() => handleDelete().then(close)}>
                  Endgültig löschen
                </Button>
                <Button variant="outline" onClick={close}>
                  Abbrechen
                </Button>
              </div>
            </>
          )}
        </Modal>
      )}
    </DashboardLayout>
  );
}
