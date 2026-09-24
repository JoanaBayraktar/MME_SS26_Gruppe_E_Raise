import jsQR from "jsqr";
import { ArrowLeft } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Alert, Card } from "../components/ui";
import { getJson } from "../lib/api";
import { ROUTES } from "../routes";

const SCAN_INTERVAL_MS = 200;
const CODE_LENGTH = 6;
const CODE_IN_TEXT_PATTERN = new RegExp(`[A-Za-z0-9]{${CODE_LENGTH}}`);

type PermissionState = "requesting" | "granted" | "denied" | "unsupported";

function extractCode(decodedText: string): string | null {
  const match = decodedText.match(CODE_IN_TEXT_PATTERN);
  return match ? match[0].toUpperCase() : null;
}

export default function QrScannerPage() {
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [permission, setPermission] = useState<PermissionState>("requesting");
  const [scanError, setScanError] = useState<string | null>(null);
  const [isChecking, setIsChecking] = useState(false);

  const goToManualEntry = useCallback(
    (scannedCode?: string) => {
      navigate(ROUTES.JOIN, { state: scannedCode ? { scannedCode } : undefined });
    },
    [navigate]
  );

  useEffect(() => {
    if (!navigator.mediaDevices?.getUserMedia) {
      setPermission("unsupported");
      return;
    }

    let cancelled = false;
    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: "environment" } })
      .then((stream) => {
        if (cancelled) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          void videoRef.current.play();
        }
        setPermission("granted");
      })
      .catch(() => setPermission("denied"));

    return () => {
      cancelled = true;
      streamRef.current?.getTracks().forEach((track) => track.stop());
    };
  }, []);

  const handleDetected = useCallback(
    async (code: string) => {
      setIsChecking(true);
      try {
        await getJson(`/api/sessions/by-code/${code}`);
        goToManualEntry(code);
      } catch {
        setScanError(`Der gescannte Code "${code}" ist ungültig.`);
        setIsChecking(false);
      }
    },
    [goToManualEntry]
  );

  useEffect(() => {
    if (permission !== "granted" || isChecking) return;

    let animationFrame: number;
    let lastScanAt = 0;

    const tick = (timestamp: number) => {
      const video = videoRef.current;
      if (!canvasRef.current) canvasRef.current = document.createElement("canvas");
      const canvas = canvasRef.current;

      if (video && video.readyState === video.HAVE_ENOUGH_DATA && timestamp - lastScanAt > SCAN_INTERVAL_MS) {
        lastScanAt = timestamp;
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const context = canvas.getContext("2d");
        if (context) {
          context.drawImage(video, 0, 0, canvas.width, canvas.height);
          const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
          const result = jsQR(imageData.data, imageData.width, imageData.height);
          const code = result ? extractCode(result.data) : null;
          if (code) {
            void handleDetected(code);
            return;
          }
        }
      }
      animationFrame = requestAnimationFrame(tick);
    };

    animationFrame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animationFrame);
  }, [permission, isChecking, handleDetected]);

  return (
    <div className="flex min-h-screen flex-col bg-gray-900 px-6 py-8 text-white">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">Code auf dem Beamer scannen</span>
        <button
          type="button"
          onClick={() => goToManualEntry()}
          aria-label="Zurück"
          className="flex h-9 w-9 items-center justify-center rounded-full transition hover:bg-white/10"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
      </div>

      <div className="mt-8 flex flex-1 flex-col items-center justify-center gap-6 text-center">
        {permission === "granted" && (
          <div className="relative aspect-square w-full max-w-xs overflow-hidden rounded-3xl border-2 border-brand">
            <video ref={videoRef} className="h-full w-full object-cover" muted playsInline />
          </div>
        )}

        {permission === "requesting" && <p className="text-sm text-gray-300">Kamera wird angefragt...</p>}

        {(permission === "denied" || permission === "unsupported") && (
          <Card className="w-full max-w-xs text-left">
            <Alert tone="error">
              {permission === "denied"
                ? "Kein Kamerazugriff. Bitte erlaube den Zugriff in den Browser-Einstellungen oder gib den Code manuell ein."
                : "Dein Browser unterstützt keinen Kamerazugriff. Bitte gib den Code manuell ein."}
            </Alert>
          </Card>
        )}

        {permission === "granted" && (
          <p className="text-sm text-gray-300">
            {isChecking ? "Code wird geprüft..." : "Kamera sucht nach QR-Code ..."}
          </p>
        )}

        {scanError && (
          <Alert tone="error" className="w-full max-w-xs">
            {scanError}
          </Alert>
        )}
      </div>

      <button
        type="button"
        onClick={() => goToManualEntry()}
        className="mt-6 text-center text-sm font-medium text-brand underline"
      >
        Code manuell eingeben
      </button>
    </div>
  );
}
