import { useMemo, useState } from "react";
import { CheckSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function ChecklistView({ text }: { text: string }) {
  const items = useMemo(() => {
    const lines = text
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);
    const out: { id: string; label: string }[] = [];
    for (const ln of lines.slice(0, 40)) {
      if (/^(\d+[\).]|-|\*)/.test(ln)) {
        out.push({ id: crypto.randomUUID(), label: ln.replace(/^(\d+[\).]|-|\*)\s*/, "") });
      }
    }
    if (!out.length) lines.slice(0, 12).forEach((ln) => out.push({ id: crypto.randomUUID(), label: ln }));
    return out.slice(0, 20);
  }, [text]);

  const [done, setDone] = useState<Record<string, boolean>>({});

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-sm">Checklist procédure</CardTitle>
        <CheckSquare className="h-4 w-4 text-accent" />
      </CardHeader>
      <CardContent className="space-y-2">
        {items.map((it) => (
          <label key={it.id} className="flex cursor-pointer items-start gap-2 text-sm">
            <input
              type="checkbox"
              className="mt-1"
              checked={!!done[it.id]}
              onChange={(e) => setDone((d) => ({ ...d, [it.id]: e.target.checked }))}
            />
            <span className={done[it.id] ? "line-through opacity-60" : ""}>{it.label}</span>
          </label>
        ))}
        <Button variant="secondary" size="sm" className="mt-2" onClick={() => setDone({})}>
          Réinitialiser
        </Button>
      </CardContent>
    </Card>
  );
}
