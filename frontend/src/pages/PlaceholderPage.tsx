import { useNavigate } from "react-router-dom";
import { BackButton, Card } from "../components/ui";

interface PlaceholderPageProps {
  title: string;
  issueNumber: number;
  backTo: string;
  // Überschreibt die reine Navigation, z. B. um beim Verlassen einer
  // resumten Session auch den lokalen Session-State zu löschen.
  onBack?: () => void;
}

export default function PlaceholderPage({ title, issueNumber, backTo, onBack }: PlaceholderPageProps) {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen items-center justify-center bg-white px-6">
      <div className="w-full max-w-xs">
        <BackButton onClick={onBack ?? (() => navigate(backTo))} className="mb-6" />

        <Card className="text-center">
          <p className="font-semibold text-gray-900">{title}</p>
          <p className="mt-2 text-sm text-gray-500">Wird in Issue #{issueNumber} umgesetzt.</p>
        </Card>
      </div>
    </div>
  );
}
