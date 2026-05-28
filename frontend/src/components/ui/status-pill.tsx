import { cn } from "@/lib/utils";

const styles = {
  idle: "bg-surface-muted text-muted border-border",
  running: "bg-accent-soft text-accent border-accent/30 animate-pulseSoft",
  done: "bg-success/10 text-success border-success/30",
  error: "bg-danger/10 text-danger border-danger/30",
  warning: "bg-warning/10 text-warning border-warning/30",
} as const;

export type StatusVariant = keyof typeof styles;

export function StatusPill({
  label,
  status = "idle",
  className,
}: {
  label: string;
  status?: StatusVariant;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-medium",
        styles[status],
        className,
      )}
    >
      {status === "running" ? (
        <span className="relative flex h-1.5 w-1.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-60" />
          <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-accent" />
        </span>
      ) : null}
      {label}
    </span>
  );
}
