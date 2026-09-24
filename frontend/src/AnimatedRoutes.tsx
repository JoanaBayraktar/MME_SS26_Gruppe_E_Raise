import { Route, Routes } from "react-router-dom";
import StyleGuide from "./StyleGuide";
import OnboardingPage from "./pages/OnboardingPage";
import JoinPage from "./pages/JoinPage";
import QrScannerPage from "./pages/QrScannerPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import SessionPlaceholderPage from "./pages/SessionPlaceholderPage";
import DozentDashboardPlaceholderPage from "./pages/DozentDashboardPlaceholderPage";
import NewSessionPage from "./pages/NewSessionPage";
import { ROUTES } from "./routes";
import { useViewTransitionLocation } from "./lib/useViewTransitionLocation";

export function AnimatedRoutes() {
  const location = useViewTransitionLocation();

  return (
    <Routes location={location}>
      <Route path={ROUTES.ONBOARDING} element={<OnboardingPage />} />
      <Route path={ROUTES.JOIN} element={<JoinPage />} />
      <Route path={ROUTES.JOIN_QR} element={<QrScannerPage />} />
      <Route path={ROUTES.SESSION} element={<SessionPlaceholderPage />} />
      <Route path={ROUTES.LOGIN} element={<LoginPage />} />
      <Route path={ROUTES.REGISTER} element={<RegisterPage />} />
      <Route path={ROUTES.FORGOT_PASSWORD} element={<ForgotPasswordPage />} />
      <Route path={ROUTES.DOZENT_DASHBOARD} element={<DozentDashboardPlaceholderPage />} />
      <Route path={ROUTES.DOZENT_SESSION_NEW} element={<NewSessionPage />} />
      <Route path={ROUTES.DESIGN_SYSTEM} element={<StyleGuide />} />
    </Routes>
  );
}
