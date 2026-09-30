import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Alert,
  BackButton,
  Badge,
  Button,
  Card,
  Field,
  Input,
} from "../components/ui";
import {
  ApiError,
  getJson,
  postJson,
  VerknuepfterDozentDto,
} from "../lib/api";
import { ROUTES } from "../routes";

export default function VeranstaltungDetailPage() {
  const navigate = useNavigate();
  const { veranstaltungId } = useParams();
  const [dozenten, setDozenten] = useState<VerknuepfterDozentDto[]>([]);
  const [kennung, setKennung] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // lädt alle dozent:innen die mit der veranstaltung verknüpft sind
  const loadDozenten = async () => {
    if (!veranstaltungId) return;

    try {
      const data = await getJson<VerknuepfterDozentDto[]>(
        `/api/veranstaltungen/${veranstaltungId}/dozenten`,
      );
      setDozenten(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Dozenten-Profile konnten nicht geladen werden.",
      );
    }
  };

  useEffect(() => {
    loadDozenten();
  }, [veranstaltungId]);

  // fügt eine weitere person über id oder mail hinzu
  const handleAddDozent = async () => {
    if (!veranstaltungId || !kennung.trim()) return;

    setError(null);
    setIsSubmitting(true);

    try {
      await postJson<VerknuepfterDozentDto>(
        `/api/veranstaltungen/${veranstaltungId}/dozenten`,
        { kennung },
      );

      setKennung("");
      await loadDozenten();
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Dozenten-Profil konnte nicht hinzugefügt werden.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 px-6 py-8">
      <div className="mx-auto w-full max-w-3xl">
        <BackButton
          onClick={() => navigate(ROUTES.DOZENT_DASHBOARD)}
          className="mb-6"
        />

        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Dozenten-Profile
          </h1>
          <p className="mt-2 text-gray-600">
            Verwalte, wer diese Veranstaltung mitmoderieren kann.
          </p>
        </div>

        <Card className="mt-6">
          {error && (
            <div className="mb-4">
              <Alert tone="error">{error}</Alert>
            </div>
          )}

          <Field
            label="Dozenten-Kennung oder E-Mail"
            htmlFor="dozent-kennung"
          >
            <div className="flex gap-3">
              <Input
                id="dozent-kennung"
                value={kennung}
                onChange={(event) => setKennung(event.target.value)}
                placeholder="z. B. 12 oder name@uni.de"
              />

              <Button
                type="button"
                className="w-auto px-4"
                disabled={isSubmitting || !kennung.trim()}
                onClick={handleAddDozent}
              >
                {isSubmitting ? "Wird hinzugefügt..." : "Hinzufügen"}
              </Button>
            </div>
          </Field>
        </Card>

        <Card className="mt-6 !p-0">
          <div className="border-b border-gray-100 px-4 py-3">
            <h2 className="font-semibold text-gray-900">
              Verknüpfte Dozent:innen
            </h2>
          </div>

          <div>
            {dozenten.map((dozent) => (
              <div
                key={dozent.id}
                className="flex items-center justify-between border-b border-gray-100 px-4 py-3 last:border-b-0"
              >
                <div>
                  <p className="font-medium text-gray-900">
                    {dozent.vorname} {dozent.nachname}
                  </p>
                  <p className="text-sm text-gray-500">{dozent.email}</p>
                  <p className="text-xs text-gray-400">
                    Kennung {dozent.id}
                  </p>
                </div>

                {dozent.istErsteller && (
                  <Badge tone="brand">Ersteller:in</Badge>
                )}
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}