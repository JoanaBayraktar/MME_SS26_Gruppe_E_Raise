import { useLayoutEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";
import { Location, useLocation, useNavigationType } from "react-router-dom";

// react-router meldet Browser-Zurück/navigate(-1) als "POP", alles andere
// (Link-Klicks, navigate(path)) als "PUSH"/"REPLACE".
const POP_NAVIGATION_TYPE = "POP";

export const TRANSITION_DIRECTION = {
  FORWARD: "forward",
  BACK: "back",
} as const;

// Attribut auf <html>, über das index.css die Animation spiegelt (siehe dort)
export const TRANSITION_DIRECTION_ATTRIBUTE = "data-transition-direction";

// Verzögert das Rendern der neuen Route, bis sie per View Transitions API
// (document.startViewTransition) mit der alten Route gleichzeitig ein- und
// ausblenden kann. Browser ohne Unterstützung wechseln direkt, ohne Fehler.
// Bei Zurück-Navigation (POP) läuft die Animation gespiegelt ab.
export function useViewTransitionLocation(): Location {
  const location = useLocation();
  const navigationType = useNavigationType();
  const [displayedLocation, setDisplayedLocation] = useState(location);
  const previousPathname = useRef(location.pathname);

  useLayoutEffect(() => {
    if (location.pathname === previousPathname.current) return;
    previousPathname.current = location.pathname;

    const direction =
      navigationType === POP_NAVIGATION_TYPE ? TRANSITION_DIRECTION.BACK : TRANSITION_DIRECTION.FORWARD;
    document.documentElement.setAttribute(TRANSITION_DIRECTION_ATTRIBUTE, direction);

    if (!document.startViewTransition) {
      setDisplayedLocation(location);
      return;
    }

    document.startViewTransition(() => {
      flushSync(() => setDisplayedLocation(location));
    });
  }, [location, navigationType]);

  return displayedLocation;
}
