import { useEffect, useState } from "react";

type HealthStatus = "checking" | "ok" | "error";

function App() {
  const [status, setStatus] = useState<HealthStatus>("checking");

  useEffect(() => {
    fetch("/api/health")
      .then((res) => (res.ok ? setStatus("ok") : setStatus("error")))
      .catch(() => setStatus("error"));
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-white px-6 text-center">
      <h1 className="text-4xl font-bold text-brand">Raise</h1>
      <p className="text-gray-600">Live-Fragen &amp; Umfragen zur Vorlesung</p>
      <p className="text-sm text-gray-400">
        Backend-Status:{" "}
        {status === "checking" && "wird geprüft..."}
        {status === "ok" && "verbunden ✓"}
        {status === "error" && "nicht erreichbar"}
      </p>
    </div>
  );
}

export default App;
