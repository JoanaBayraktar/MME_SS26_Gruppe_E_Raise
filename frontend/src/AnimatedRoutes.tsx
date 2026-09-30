import { useEffect, useState } from "react";
import { Navigate, Route, Routes, useNavigate, useParams } from "react-router-dom";
import StyleGuide from "./StyleGuide";
import OnboardingPage from "./pages/OnboardingPage";
import JoinPage from "./pages/JoinPage";
import QrScannerPage from "./pages/QrScannerPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import SessionPlaceholderPage from "./pages/SessionPlaceholderPage";
import DozentDashboardPage from "./pages/DozentDashboardPage";
import SessionsPage from "./pages/SessionsPage";
import SessionDetailPage from "./pages/SessionDetailPage";
import NewSessionPage from "./pages/NewSessionPage";
import NewVeranstaltungPage from "./pages/NewVeranstaltungPage";
import PlaceholderPage from "./pages/PlaceholderPage";
import AccountPage from "./pages/AccountPage";
import { ROUTES } from "./routes";
import NavigationPage from "./pages/NavigationPage";
import Archiv from "./pages/archiv/Archiv";
import Questions from "./pages/questions/questions";
import Umfrage from "./pages/umfrage/umfrage";
import { getJson, SessionDetailDto } from "./lib/api";
import { formatUhrzeit } from "./lib/formatDate";

// Wrapper-Komponente, die die Session-Daten lädt und an die NavigationPage übergibt
function DozentLiveLayout() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const [session, setSession] = useState<SessionDetailDto | null>(null);

  useEffect(() => {
    if (sessionId) {
      getJson<SessionDetailDto>(`/api/sessions/${sessionId}`)
        .then((data) => setSession(data))
        .catch((err) => console.error("Fehler beim Laden der Session für die Live-Ansicht", err));
    }
  }, [sessionId]);

  return (
    <NavigationPage
      isDozent={true}
      courseName={session?.veranstaltungName ?? "Lade Veranstaltung..."}
      sessionTitle={session ? `${session.name} · ${formatUhrzeit(session.startZeit)}` : "Lade Session..."}
      courseCode={session ? `#${session.code}` : "..."}
      onBack={() => navigate(sessionId ? `${ROUTES.DOZENT_SESSIONS}/${sessionId}` : ROUTES.DOZENT_SESSIONS)}
    />
  );
}

export function AnimatedRoutes() {
  return (
    <Routes>
      <Route path={ROUTES.ONBOARDING} element={<OnboardingPage />} />
      <Route path={ROUTES.JOIN} element={<JoinPage />} />
      <Route path={ROUTES.JOIN_QR} element={<QrScannerPage />} />
      <Route path={ROUTES.SESSION} element={<SessionPlaceholderPage />} />
      <Route path={ROUTES.LOGIN} element={<LoginPage />} />
      <Route path={ROUTES.REGISTER} element={<RegisterPage />} />
      <Route path={ROUTES.FORGOT_PASSWORD} element={<ForgotPasswordPage />} />
      <Route path={ROUTES.DOZENT_DASHBOARD} element={<DozentDashboardPage />} />
      <Route path={ROUTES.DOZENT_SESSIONS} element={<SessionsPage />}>
        <Route path="neu" element={<NewSessionPage />} />
        <Route path=":sessionId" element={<SessionDetailPage />} />
      </Route>
      <Route path={`${ROUTES.DOZENT_SESSIONS}/:sessionId`} element={<SessionDetailPage />} />
      
      {/* Dozenten Live-Ansicht mit dynamischem Wrapper */}
      <Route path={`${ROUTES.DOZENT_SESSIONS}/:sessionId/live`} element={<DozentLiveLayout />}>
        <Route index element={<Navigate to="questions" replace />} />
        <Route path="questions" element={<Questions />} />
        <Route path="umfrage" element={<Umfrage />} />
        <Route path="archiv" element={<Archiv />} />
      </Route>

      <Route path={ROUTES.DOZENT_VERANSTALTUNG_NEW} element={<NewVeranstaltungPage />} />
      <Route
        path={ROUTES.DOZENT_ARCHIV}
        element={<PlaceholderPage title="Archiv" issueNumber={27} backTo={ROUTES.DOZENT_DASHBOARD} />}
      />
      <Route path={ROUTES.DOZENT_ACCOUNT} element={<AccountPage />} />
      <Route path={ROUTES.DESIGN_SYSTEM} element={<StyleGuide />} />
      <Route path={ROUTES.NAVIGATION} element={<NavigationPage />}>
        <Route path="questions" element={<Questions />} />
        <Route path="umfrage" element={<Umfrage />} />
        <Route path="archiv" element={<Archiv />} />
      </Route>
    </Routes>
  );
}