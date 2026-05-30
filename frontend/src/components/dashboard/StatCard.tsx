import type { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  accent = "accent",
}: {
  label: string;
  value: string | number;
  hint?: string;
  icon: LucideIcon;
  accent?: "accent" | "gold" | "primary";
}) {
  const iconBg = {
    accent: "bg-accent-soft text-violet-700 dark:text-violet-300",
    gold: "bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300",
    primary: "bg-violet-50 text-violet-800 dark:bg-violet-950/50 dark:text-violet-200",
  }[accent];

  return (
    <Card className="h-full transition-shadow hover:shadow-card">
      <CardContent className="flex h-full items-start justify-between gap-4 p-5">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-600 dark:text-slate-400">{label}</p>
          <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50">{value}</p>
          {hint ? <p className="mt-1 line-clamp-2 text-xs text-slate-500 dark:text-slate-400">{hint}</p> : null}
        </div>
        <div className={cn("flex h-11 w-11 shrink-0 items-center justify-center rounded-xl", iconBg)}>
          <Icon className="h-5 w-5" />
        </div>
      </CardContent>
    </Card>
  );
}
