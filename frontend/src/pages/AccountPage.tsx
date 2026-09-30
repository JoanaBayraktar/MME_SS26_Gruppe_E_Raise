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

const profileSchema = z.object({
  vorname: z.string().trim().min(1, "Bitte gib deinen Vornamen ein."),
  nachname: z.string().trim().min(1, "Bitte gib deinen Nachnamen ein."),
  email: z.string().trim().email("Bitte gib eine gültige E-Mail-Adresse ein."),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, "Bitte gib dein aktuelles Passwort ein."),
    newPassword: z
      .string()
      .min(PASSWORD_MIN_LENGTH, `Das neue Passwort muss mindestens ${PASSWORD_MIN_LENGTH} Zeichen haben.`),
    newPasswordRepeat: z.string(),
  })
  .refine((values) => values.newPassword === values.newPasswordRepeat, {
    message: "Die Passwörter stimmen nicht überein.",
    path: ["newPasswordRepeat"],
  });

type PasswordFormValues = z.infer<typeof passwordSchema>;

type LoadState = "loading" | "loaded" | "error";
type ConfirmDialog = "none" | "password" | "logout" | "delete-1" | "delete-2";

export default function AccountPage() {
  const navigate = useNavigate();
  const [loadState, setLoadState] = useState<LoadState>("loading");
  const [dozent, setDozent] = useState<DozentDto | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState<ConfirmDialog>("none");
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ProfileFormValues>({ resolver: zodResolver(profileSchema) });
  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    reset: resetPasswordForm,
    watch: watchPassword,
    formState: { errors: passwordErrors, isSubmitting: isSubmittingPassword, isValid: isPasswordFormValid },
  } = useForm<PasswordFormValues>({ resolver: zodResolver(passwordSchema), mode: "onChange" });
  const newPassword = watchPassword("newPassword");
  const newPasswordRepeat = watchPassword("newPasswordRepeat");
  const newPasswordIsValidLength = (newPassword?.length ?? 0) >= PASSWORD_MIN_LENGTH;
  const newPasswordsMatch = !!newPassword && newPassword === newPasswordRepeat;

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
      });
      setStoredSession({ role: ROLE.DOZENT, name: `${updated.vorname} ${updated.nachname}` });
      setDozent(updated);
      reset({ vorname: updated.vorname, nachname: updated.nachname, email: updated.email });
      setSaveSuccess(true);
    } catch (err) {
      setSaveError(err instanceof ApiError ? err.message : "Profil konnte nicht gespeichert werden.");
    }
  };

  const onSubmitPassword = (close: () => void) => async (values: PasswordFormValues) => {
    if (!dozent) return;
    setPasswordError(null);
    try {
      await patchJson<DozentDto>("/api/auth/me", {
        vorname: dozent.vorname,
        nachname: dozent.nachname,
        email: dozent.email,
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      });
      resetPasswordForm();
      close();
    } catch (err) {
      setPasswordError(err instanceof ApiError ? err.message : "Passwort konnte nicht geändert werden.");
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

              <Button type="submit" disabled={isSubmitting} className="w-auto px-4">
                {isSubmitting ? "Wird gespeichert..." : "Speichern"}
              </Button>
            </form>
          </Card>

          <Card className="max-w-lg !p-0">
            <div className="flex items-center justify-between gap-4 px-5 py-4">
              <div>
                <p className="text-sm font-medium text-gray-900">Passwort ändern</p>
                <p className="text-xs text-gray-500">Vergib ein neues Passwort für deinen Account.</p>
              </div>
              <Button
                variant="outline"
                className="!w-44 shrink-0"
                onClick={() => {
                  setPasswordError(null);
                  resetPasswordForm();
                  setConfirmDialog("password");
                }}
              >
                Passwort ändern
              </Button>
            </div>

            <div className="flex items-center justify-between gap-4 border-t border-gray-100 px-5 py-4">
              <div>
                <p className="text-sm font-medium text-gray-900">Logout</p>
                <p className="text-xs text-gray-500">Meldet dich von diesem Gerät ab.</p>
              </div>
              <Button
                variant="outline"
                className="!w-44 shrink-0"
                onClick={() => setConfirmDialog("logout")}
              >
                Logout
              </Button>
            </div>

            <div className="flex items-center justify-between gap-4 border-t border-gray-100 px-5 py-4">
              <div>
                <p className="text-sm font-medium text-red-600">Account löschen</p>
                <p className="text-xs text-gray-500">Entfernt deinen Account unwiderruflich.</p>
              </div>
              <Button
                variant="outline"
                className="!w-44 shrink-0 !text-red-600"
                onClick={() => setConfirmDialog("delete-1")}
              >
                Account löschen
              </Button>
            </div>
          </Card>
        </div>
      )}

      {confirmDialog === "password" && (
        <Modal className="max-w-sm p-6" onClose={() => setConfirmDialog("none")}>
          {(close) => (
            <form onSubmit={handlePasswordSubmit(onSubmitPassword(close))}>
              <h2 className="text-lg font-bold text-gray-900">Passwort ändern</h2>

              <div className="mt-4 flex flex-col gap-4">
                {passwordError && <Alert tone="error">{passwordError}</Alert>}

                <Field
                  label="Aktuelles Passwort"
                  htmlFor="currentPassword"
                  error={passwordErrors.currentPassword?.message}
                >
                  <Input id="currentPassword" type="password" {...registerPassword("currentPassword")} />
                </Field>
                <Field label="Neues Passwort" htmlFor="newPassword" error={passwordErrors.newPassword?.message}>
                  <Input id="newPassword" type="password" {...registerPassword("newPassword")} />
                  {!passwordErrors.newPassword && newPasswordIsValidLength && (
                    <p className="mt-1 text-xs text-green-600">Passwort ist lang genug.</p>
                  )}
                </Field>
                <Field
                  label="Neues Passwort wiederholen"
                  htmlFor="newPasswordRepeat"
                  error={passwordErrors.newPasswordRepeat?.message}
                >
                  <Input id="newPasswordRepeat" type="password" {...registerPassword("newPasswordRepeat")} />
                  {!passwordErrors.newPasswordRepeat && newPasswordsMatch && (
                    <p className="mt-1 text-xs text-green-600">Passwörter stimmen überein.</p>
                  )}
                </Field>
              </div>

              <div className="mt-6 flex gap-3">
                <Button type="submit" disabled={isSubmittingPassword || !isPasswordFormValid}>
                  {isSubmittingPassword ? "Wird geändert..." : "Bestätigen"}
                </Button>
                <Button type="button" variant="outline" onClick={close}>
                  Abbrechen
                </Button>
              </div>
            </form>
          )}
        </Modal>
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
