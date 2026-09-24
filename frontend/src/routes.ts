export const ROUTES = {
  ONBOARDING: "/",
  JOIN: "/join",
  JOIN_QR: "/join/scan",
  SESSION: "/session",
  LOGIN: "/login",
  REGISTER: "/register",
  FORGOT_PASSWORD: "/passwort-vergessen",
  DOZENT_DASHBOARD: "/dozent",
  DOZENT_SESSIONS: "/dozent/sessions",
  DOZENT_ARCHIV: "/dozent/archiv",
  DOZENT_ACCOUNT: "/dozent/account",
  DOZENT_SESSION_NEW: "/dozent/sessions/neu",
  DOZENT_VERANSTALTUNG_NEW: "/dozent/veranstaltungen/neu",
  DOZENT_VERANSTALTUNG_DETAIL: "/dozent/veranstaltungen/:id",
  DESIGN_SYSTEM: "/design-system",
} as const;

export function buildVeranstaltungDetailPath(id: number | string): string {
  return `/dozent/veranstaltungen/${id}`;
}

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
  [ROUTES.DOZENT_SESSIONS]: 2,
  [ROUTES.DOZENT_ARCHIV]: 2,
  [ROUTES.DOZENT_ACCOUNT]: 2,
  [ROUTES.DOZENT_SESSION_NEW]: 3,
  [ROUTES.DOZENT_VERANSTALTUNG_NEW]: 3,
};

// /dozent/veranstaltungen/:id hat immer die Tiefe 3, unabhängig von der
// konkreten ID – kann daher nicht als fixer Key in ROUTE_DEPTH stehen.
const VERANSTALTUNG_DETAIL_PREFIX = "/dozent/veranstaltungen/";
const VERANSTALTUNG_DETAIL_DEPTH = 3;

export function getRouteDepth(pathname: string): number | undefined {
  if (pathname in ROUTE_DEPTH) return ROUTE_DEPTH[pathname];
  if (pathname.startsWith(VERANSTALTUNG_DETAIL_PREFIX)) return VERANSTALTUNG_DETAIL_DEPTH;
  return undefined;
}
