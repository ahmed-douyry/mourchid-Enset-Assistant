import { Badge } from "@/components/ui/badge";

export function ConfidenceBadge({ score }: { score: number }) {
  const pct = Math.round(score * 100);
  const variant = score >= 0.75 ? "success" : score >= 0.5 ? "gold" : "secondary";
  return <Badge variant={variant}>Confiance {pct}%</Badge>;
}
