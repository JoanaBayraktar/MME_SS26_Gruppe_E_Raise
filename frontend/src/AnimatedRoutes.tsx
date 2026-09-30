import { Navigate, Route, Routes } from "react-router-dom";
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
import { ROUTES } from "./routes";
import { useViewTransitionLocation } from "./lib/useViewTransitionLocation";
import VeranstaltungDetailPage from "./pages/VeranstaltungDetailPage";
import NavigationPage from "./pages/NavigationPage";
import Archiv from "./pages/archiv/Archiv";
import Questions from "./pages/questions/questions";
import Umfrage from "./pages/umfrage/umfrage";

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
      <Route
        path={`${ROUTES.DOZENT_SESSIONS}/:sessionId`}
        element={<SessionDetailPage />}
      />
      <Route
        path={ROUTES.DOZENT_VERANSTALTUNG_NEW}
        element={<NewVeranstaltungPage />}
      />
      <Route
        path={`${ROUTES.DOZENT_VERANSTALTUNGEN}/:veranstaltungId`}
        element={<VeranstaltungDetailPage />}
      />
      <Route
        path={ROUTES.DOZENT_ARCHIV}
        element={
          <PlaceholderPage
            title="Archiv"
            issueNumber={27}
            backTo={ROUTES.DOZENT_DASHBOARD}
          />
        }
      />
      <Route
        path={ROUTES.DOZENT_ACCOUNT}
        element={
          <PlaceholderPage
            title="Account"
            issueNumber={9}
            backTo={ROUTES.DOZENT_DASHBOARD}
          />
        }
      />
      <Route path={ROUTES.DESIGN_SYSTEM} element={<StyleGuide />} />
      <Route path={ROUTES.NAVIGATION} element={<NavigationPage />}>
        <Route path={ROUTES.QUESTIONS} element={<Questions />} />
        <Route path={ROUTES.UMFRAGE} element={<Umfrage />} />
        <Route path={ROUTES.ARCHIV} element={<Archiv />} />
      </Route>
    </Routes>
  );
}
