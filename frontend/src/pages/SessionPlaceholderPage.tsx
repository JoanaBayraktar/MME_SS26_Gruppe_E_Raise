import { useNavigate } from "react-router-dom";
import PlaceholderPage from "./PlaceholderPage";
import { clearStoredSession } from "../lib/session";
import { ROUTES } from "../routes";

// Die "echte" Fragen-Feed-Ansicht kommt erst mit #16. Bis dahin: Zurück
// bedeutet hier "Sitzung verlassen", nicht "zurück zum Formular" – wer per
// Resume (Onboarding → Weiter) direkt hierher springt, hat das Formular ja
// nie gesehen.
export default function SessionPlaceholderPage() {
  const navigate = useNavigate();

  const leaveSession = () => {
    clearStoredSession();
    navigate(ROUTES.ONBOARDING);
  };

  return <PlaceholderPage title="Fragen-Feed" issueNumber={16} backTo={ROUTES.ONBOARDING} onBack={leaveSession} />;
}
