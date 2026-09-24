import { Route, Routes } from "react-router-dom";
import StyleGuide from "./StyleGuide";
import OnboardingPage from "./pages/OnboardingPage";
import JoinPage from "./pages/JoinPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import PlaceholderPage from "./pages/PlaceholderPage";
import SessionPlaceholderPage from "./pages/SessionPlaceholderPage";
import { ROUTES } from "./routes";
import { useViewTransitionLocation } from "./lib/useViewTransitionLocation";

export function AnimatedRoutes() {
  const location = useViewTransitionLocation();

  return (
    <Routes location={location}>
      <Route path={ROUTES.ONBOARDING} element={<OnboardingPage />} />
      <Route path={ROUTES.JOIN} element={<JoinPage />} />
      <Route path={ROUTES.SESSION} element={<SessionPlaceholderPage />} />
      <Route path={ROUTES.LOGIN} element={<LoginPage />} />
      <Route path={ROUTES.REGISTER} element={<RegisterPage />} />
      <Route path={ROUTES.FORGOT_PASSWORD} element={<ForgotPasswordPage />} />
      <Route
        path={ROUTES.DOZENT_DASHBOARD}
        element={<PlaceholderPage title="Dozenten-Dashboard" issueNumber={11} backTo={ROUTES.ONBOARDING} />}
      />
      <Route path={ROUTES.DESIGN_SYSTEM} element={<StyleGuide />} />
    </Routes>
  );
}
