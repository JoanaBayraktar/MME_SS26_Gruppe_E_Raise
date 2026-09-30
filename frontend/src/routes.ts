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
  DOZENT_VERANSTALTUNGEN: "/dozent/veranstaltungen",
  DESIGN_SYSTEM: "/design-system",
  NAVIGATION: "/navigation",
  ARCHIV: "/navigation/archiv",
  QUESTIONS: "/navigation/questions",
  UMFRAGE: "/navigation/umfrage",
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
  [ROUTES.DOZENT_SESSIONS]: 2,
  [ROUTES.DOZENT_ARCHIV]: 2,
  [ROUTES.DOZENT_ACCOUNT]: 2,
  [ROUTES.DOZENT_SESSION_NEW]: 3,
  [ROUTES.DOZENT_VERANSTALTUNG_NEW]: 3,
};

export function buildSessionDetailPath(sessionId: number): string {
  return `${ROUTES.DOZENT_SESSIONS}/${sessionId}`;
}

// baut den link zur jeweiligen veranstaltung zusammen
export function buildVeranstaltungDetailPath(
  veranstaltungId: number,
): string {
  return `${ROUTES.DOZENT_VERANSTALTUNGEN}/${veranstaltungId}`;
}

// Detailseite einer einzelnen Session ("/dozent/sessions/123") – dynamisch,
// deshalb kein fixer Eintrag in ROUTES/ROUTE_DEPTH, sondern per Präfix erkannt.
// Ausgenommen "neu", das ist eine eigene (modale) Route, keine Session-ID.
function isSessionDetailRoute(pathname: string): boolean {
  return (
    pathname.startsWith(`${ROUTES.DOZENT_SESSIONS}/`) &&
    pathname !== ROUTES.DOZENT_SESSION_NEW &&
    /^\/\d+$/.test(pathname.slice(ROUTES.DOZENT_SESSIONS.length))
  );
}

export function getRouteDepth(pathname: string): number | undefined {
  return ROUTE_DEPTH[pathname];
}

// Routen innerhalb des Dozenten-Dashboards teilen sich Sidebar und Header
// (DashboardLayout) – beim Wechsel zwischen ihnen ändert sich nur der Inhalt,
// nicht der ganze Screen. Eine volle Seitenübergangs-Animation würde dort
// fälschlich auch Sidebar/Header mit animieren.
const DASHBOARD_SHELL_ROUTES: Set<string> = new Set([
  ROUTES.DOZENT_DASHBOARD,
  ROUTES.DOZENT_SESSIONS,
  ROUTES.DOZENT_ARCHIV,
  ROUTES.DOZENT_ACCOUNT,
]);

export function sharesLayoutShell(pathnameA: string, pathnameB: string): boolean {
  return DASHBOARD_SHELL_ROUTES.has(pathnameA) && DASHBOARD_SHELL_ROUTES.has(pathnameB);
}

// Routen, die sich als Overlay (Backdrop + zentrierte Karte) über dem
// Hintergrund öffnen, statt als eigener Screen. Ein seitliches Reinschieben
// wie bei echten Screens würde hier komisch aussehen – stattdessen blendet
// die Karte sanft ein/aus. Die aufrufende Seite bleibt dabei gemountet
// (siehe Outlet in SessionsPage), das Overlay animiert sich selbst per CSS.
const MODAL_ROUTES: Set<string> = new Set([ROUTES.DOZENT_SESSION_NEW]);

export function isModalRoute(pathname: string): boolean {
  return MODAL_ROUTES.has(pathname) || isSessionDetailRoute(pathname);
}
