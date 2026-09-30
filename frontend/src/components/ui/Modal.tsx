import { ReactNode, useEffect, useState } from "react";
import { Card } from "./Card";

// Muss zur duration-200-Klasse unten passen, damit onClose erst nach dem
// Ausblenden feuert (z. B. bevor eine aufrufende Seite wegnavigiert).
const FADE_DURATION_MS = 200;

interface ModalProps {
  onClose: () => void;
  className?: string;
  children: (close: () => void) => ReactNode;
}

// Overlay, das über der aufrufenden Seite einblendet statt sie zu ersetzen –
// der Hintergrund bleibt sichtbar und wird nur durch den Backdrop abgedunkelt.
// Für Modal-Routen: die aufrufende Seite bleibt gemountet (siehe Outlet in
// SessionsPage), nur dieses Overlay kommt per verschachtelter Route dazu.
export function Modal({ onClose, className = "", children }: ModalProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  const close = () => {
    setVisible(false);
    window.setTimeout(onClose, FADE_DURATION_MS);
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-gray-900/40 p-6 transition-opacity duration-200 ${
        visible ? "opacity-100" : "opacity-0"
      }`}
      onClick={close}
    >
      <Card
        className={`w-full transition-opacity duration-200 ${visible ? "opacity-100" : "opacity-0"} ${className}`}
        onClick={(event) => event.stopPropagation()}
      >
        {children(close)}
      </Card>
    </div>
  );
}
