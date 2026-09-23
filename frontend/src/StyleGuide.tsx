import { useState } from "react";
import { BarChart3 } from "lucide-react";
import {
  Alert,
  Avatar,
  Badge,
  Button,
  Card,
  Checkbox,
  EmptyState,
  Input,
  ProgressBar,
  SegmentedControl,
  Textarea,
} from "./components/ui";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="w-full max-w-md">
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-400">{title}</h2>
      <div className="flex flex-col gap-3">{children}</div>
    </section>
  );
}

export default function StyleGuide() {
  const [role, setRole] = useState<"student" | "dozent">("student");

  return (
    <div className="min-h-screen bg-white px-6 py-10">
      <div className="mx-auto flex max-w-md flex-col gap-10">
        <div>
          <h1 className="text-3xl font-bold text-brand">Raise – Design-System</h1>
        </div>

        <Section title="Buttons">
          <Button variant="primary">Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="primary" disabled>
            Disabled
          </Button>
        </Section>

        <Section title="Segmented Control">
          <SegmentedControl
            aria-label="Rolle wählen"
            value={role}
            onChange={setRole}
            options={[
              { value: "student", label: "Studi" },
              { value: "dozent", label: "Dozi" },
            ]}
          />
        </Section>

        <Section title="Badges (Fragen-Status)">
          <div className="flex flex-wrap gap-2">
            <Badge tone="neutral">neu</Badge>
            <Badge tone="brand">gefragt</Badge>
            <Badge tone="success">beantwortet</Badge>
            <Badge tone="muted">irrelevant</Badge>
          </div>
        </Section>

        <Section title="Card">
          <Card>
            <p className="text-sm font-medium text-gray-900">
              Können wir Folie 12 nochmal genauer durchgehen?
            </p>
            <div className="mt-2 flex gap-2">
              <Badge tone="brand">gefragt</Badge>
              <Badge tone="neutral">Kap. 4 · Folie 36</Badge>
            </div>
          </Card>
        </Section>

        <Section title="Inputs">
          <Input placeholder="z. B. Lisa" />
          <Textarea placeholder="Was würdest du gerne wissen?" rows={3} />
          <Checkbox label="Anonym bleiben" defaultChecked />
        </Section>

        <Section title="Avatar">
          <div className="flex items-center gap-3">
            <Avatar name="Nils Hellwig" variant="brand" />
            <Avatar name="Anonymer Fuchs" />
          </div>
        </Section>

        <Section title="Progress Bar">
          <ProgressBar label="Ja, komplett" percentage={58} highlight />
          <ProgressBar label="Größtenteils" percentage={27} />
        </Section>

        <Section title="Alert">
          <Alert tone="success">Deine Stimme wurde gezählt</Alert>
          <Alert tone="error">Das hat leider nicht geklappt</Alert>
          <Alert tone="info">Sobald Nils eine Umfrage startet, erscheint sie hier</Alert>
        </Section>

        <Section title="Empty State">
          <Card>
            <EmptyState
              icon={BarChart3}
              title="Derzeit keine Umfrage"
              description="Sobald Nils eine Umfrage startet, erscheint sie automatisch hier."
            />
          </Card>
        </Section>
      </div>
    </div>
  );
}
