import { useNavigate } from "react-router-dom";
import { BackButton, Card } from "../components/ui";

interface PlaceholderPageProps {
  title: string;
  issueNumber: number;
  backTo: string;
}

export default function PlaceholderPage({ title, issueNumber, backTo }: PlaceholderPageProps) {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen items-center justify-center bg-white px-6">
      <div className="w-full max-w-xs">
        <BackButton onClick={() => navigate(backTo)} className="mb-6" />

        <Card className="text-center">
          <p className="font-semibold text-gray-900">{title}</p>
          <p className="mt-2 text-sm text-gray-500">Wird in Issue #{issueNumber} umgesetzt.</p>
        </Card>
      </div>
    </div>
  );
}
