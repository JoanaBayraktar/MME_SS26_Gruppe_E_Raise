import { Route, Routes } from "react-router-dom";
import StyleGuide from "./StyleGuide";
import OnboardingPage from "./pages/OnboardingPage";
import JoinPage from "./pages/JoinPage";
import PlaceholderPage from "./pages/PlaceholderPage";
import { ROUTES } from "./routes";
import { useViewTransitionLocation } from "./lib/useViewTransitionLocation";

export function AnimatedRoutes() {
  const location = useViewTransitionLocation();

  return (
    <Routes location={location}>
      <Route path={ROUTES.ONBOARDING} element={<OnboardingPage />} />
      <Route path={ROUTES.JOIN} element={<JoinPage />} />
      <Route
        path={ROUTES.SESSION}
        element={<PlaceholderPage title="Fragen-Feed" issueNumber={16} backTo={ROUTES.JOIN} />}
      />
      <Route
        path={ROUTES.LOGIN}
        element={<PlaceholderPage title="Dozenten-Login" issueNumber={8} backTo={ROUTES.ONBOARDING} />}
      />
      <Route
        path={ROUTES.DOZENT_DASHBOARD}
        element={<PlaceholderPage title="Dozenten-Dashboard" issueNumber={11} backTo={ROUTES.ONBOARDING} />}
      />
      <Route path={ROUTES.DESIGN_SYSTEM} element={<StyleGuide />} />
    </Routes>
  );
}
