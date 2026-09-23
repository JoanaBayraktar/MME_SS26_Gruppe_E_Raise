import { useNavigate } from "react-router-dom";
import { Card } from "../components/ui";

interface PlaceholderPageProps {
  title: string;
  issueNumber: number;
}

export default function PlaceholderPage({ title, issueNumber }: PlaceholderPageProps) {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-white px-6 text-center">
      <Card className="max-w-sm">
        <p className="font-semibold text-gray-900">{title}</p>
        <p className="mt-2 text-sm text-gray-500">Wird in Issue #{issueNumber} umgesetzt.</p>
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="mt-4 text-sm text-brand underline"
        >
          Zurück
        </button>
      </Card>
    </div>
  );
}
