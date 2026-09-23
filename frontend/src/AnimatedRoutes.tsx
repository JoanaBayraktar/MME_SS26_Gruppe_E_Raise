import { Route, Routes } from "react-router-dom";
import StyleGuide from "./StyleGuide";
import OnboardingPage from "./pages/OnboardingPage";
import PlaceholderPage from "./pages/PlaceholderPage";
import { ROUTES } from "./routes";
import { useViewTransitionLocation } from "./lib/useViewTransitionLocation";

export function AnimatedRoutes() {
  const location = useViewTransitionLocation();

  return (
    <Routes location={location}>
      <Route path={ROUTES.ONBOARDING} element={<OnboardingPage />} />
      <Route path={ROUTES.JOIN} element={<PlaceholderPage title="Raumbeitritt" issueNumber={6} />} />
      <Route path={ROUTES.LOGIN} element={<PlaceholderPage title="Dozenten-Login" issueNumber={8} />} />
      <Route
        path={ROUTES.DOZENT_DASHBOARD}
        element={<PlaceholderPage title="Dozenten-Dashboard" issueNumber={11} />}
      />
      <Route path={ROUTES.DESIGN_SYSTEM} element={<StyleGuide />} />
    </Routes>
  );
}
