export const ROUTES = {
  ONBOARDING: "/",
  JOIN: "/join",
  JOIN_QR: "/join/scan",
  SESSION: "/session",
  LOGIN: "/login",
  REGISTER: "/register",
  FORGOT_PASSWORD: "/passwort-vergessen",
  DOZENT_DASHBOARD: "/dozent",
  DESIGN_SYSTEM: "/design-system",
} as const;

// Tiefe jeder Route in der Navigationshierarchie (Onboarding = Wurzel).
// Bestimmt die Richtung der Seitenübergangs-Animation unabhängig vom
// Browser-Verlauf (der z. B. nach einem Reload leer sein kann).
export const ROUTE_DEPTH: Record<string, number> = {
  [ROUTES.ONBOARDING]: 0,
  [ROUTES.DESIGN_SYSTEM]: 0,
  [ROUTES.JOIN]: 1,
  [ROUTES.LOGIN]: 1,
  [ROUTES.SESSION]: 2,
  [ROUTES.DOZENT_DASHBOARD]: 2,
  [ROUTES.REGISTER]: 2,
  [ROUTES.FORGOT_PASSWORD]: 2,
  [ROUTES.JOIN_QR]: 2,
};
