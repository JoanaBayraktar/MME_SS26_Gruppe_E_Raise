import { useLayoutEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";
import { Location, useLocation } from "react-router-dom";
import { getRouteDepth as lookupRouteDepth, sharesLayoutShell } from "../routes";

export const TRANSITION_DIRECTION = {
  FORWARD: "forward",
  BACK: "back",
} as const;

// Attribut auf <html>, über das index.css die Animation spiegelt (siehe dort)
export const TRANSITION_DIRECTION_ATTRIBUTE = "data-transition-direction";

// Route ohne Eintrag in ROUTE_DEPTH (sollte nicht vorkommen) zählt als "tief",
// damit ein Wechsel dorthin nie fälschlich als "zurück" gewertet wird.
const UNKNOWN_ROUTE_DEPTH = Number.POSITIVE_INFINITY;

function getRouteDepth(pathname: string): number {
  return lookupRouteDepth(pathname) ?? UNKNOWN_ROUTE_DEPTH;
}

// Verzögert das Rendern der neuen Route, bis sie per View Transitions API
// (document.startViewTransition) mit der alten Route gleichzeitig ein- und
// ausblenden kann. Browser ohne Unterstützung wechseln direkt, ohne Fehler.
// Die Animationsrichtung ergibt sich aus der Routen-Hierarchie (ROUTE_DEPTH),
// nicht aus dem Browser-Verlauf – der ist z. B. nach einem Reload leer und
// würde "Zurück" sonst nicht als solches erkennen.
export function useViewTransitionLocation(): Location {
  const location = useLocation();
  const [displayedLocation, setDisplayedLocation] = useState(location);
  const previousPathname = useRef(location.pathname);
  // Läuft gerade eine Transition, wird sie hier gehalten, damit eine neue
  // Navigation sie sauber abbricht statt eine "InvalidStateError" zu werfen
  // (kann sonst bei schnell aufeinanderfolgenden Navigationen passieren).
  const activeTransition = useRef<ReturnType<typeof document.startViewTransition> | null>(null);

  useLayoutEffect(() => {
    if (location.pathname === previousPathname.current) return;

    if (sharesLayoutShell(location.pathname, previousPathname.current)) {
      previousPathname.current = location.pathname;
      setDisplayedLocation(location);
      return;
    }

    const direction =
      getRouteDepth(location.pathname) < getRouteDepth(previousPathname.current)
        ? TRANSITION_DIRECTION.BACK
        : TRANSITION_DIRECTION.FORWARD;
    previousPathname.current = location.pathname;
    document.documentElement.setAttribute(TRANSITION_DIRECTION_ATTRIBUTE, direction);

    activeTransition.current?.skipTransition();

    if (!document.startViewTransition) {
      setDisplayedLocation(location);
      return;
    }

    const transition = document.startViewTransition(() => {
      flushSync(() => setDisplayedLocation(location));
    });
    activeTransition.current = transition;
    transition.finished.finally(() => {
      if (activeTransition.current === transition) {
        activeTransition.current = null;
      }
    });
    // "ready" kann ablehnen, wenn z. B. das Dokument gerade nicht sichtbar/
    // fokussiert ist (z. B. Hintergrund-Tab). Wir werten sie nicht aus, aber
    // ohne catch würde das als unhandled rejection in der Konsole auftauchen.
    transition.ready.catch(() => {});
  }, [location]);

  return displayedLocation;
}
