import { Navigate, Route, Routes } from "react-router-dom";
import StyleGuide from "./StyleGuide";
import OnboardingPage from "./pages/OnboardingPage";
import PlaceholderPage from "./pages/PlaceholderPage";
import { ROUTES } from "./routes";
import NavigationPage from "./pages/NavigationPage";
import Archiv from "./pages/archiv/Archiv";
import Questions from "./pages/questions/questions";
import Umfrage from "./pages/umfrage/umfrage";

export function AnimatedRoutes() {
  return (
    <Routes>
      <Route path={ROUTES.ONBOARDING} element={<OnboardingPage />} />
      <Route path={ROUTES.JOIN} element={<PlaceholderPage title="Raumbeitritt" issueNumber={6} />} />
      <Route path={ROUTES.LOGIN} element={<PlaceholderPage title="Dozenten-Login" issueNumber={8} />} />
      <Route
        path={ROUTES.DOZENT_DASHBOARD}
        element={<PlaceholderPage title="Dozenten-Dashboard" issueNumber={11} />}
      />
      <Route path={ROUTES.DESIGN_SYSTEM} element={<StyleGuide />} />
      <Route path={ROUTES.NAVIGATION} element={<NavigationPage />}>
        <Route index element={<Questions />} />
        <Route path="questions" element={<Questions />} />
        <Route path="umfrage" element={<Umfrage />} />
        <Route path="archiv" element={<Archiv />} />
      </Route>
      <Route path="/questions" element={<Navigate to={ROUTES.QUESTIONS} replace />} />
      <Route path="/umfrage" element={<Navigate to={ROUTES.UMFRAGE} replace />} />
      <Route path="/archiv" element={<Navigate to={ROUTES.ARCHIV} replace />} />
    </Routes>
  );
}
