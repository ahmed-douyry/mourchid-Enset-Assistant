import { motion } from "framer-motion";
import { Bot } from "lucide-react";
import { cn } from "@/lib/utils";

const PHASE_LABELS: Record<string, string> = {
  analyze: "Analyse en cours",
  search: "Recherche dans les documents",
  agents: "Coordination des agents",
  verify: "Vérification des sources",
  synth: "L'agent prépare la réponse",
};

function AnimatedDots() {
  return (
    <span className="inline-flex w-6 gap-0.5" aria-hidden>
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="inline-block h-1 w-1 rounded-full bg-violet-brand dark:bg-violet-300"
          animate={{ opacity: [0.25, 1, 0.25] }}
          transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
        />
      ))}
    </span>
  );
}

export function AgentTypingIndicator({
  phase,
  className,
}: {
  phase?: string | null;
  className?: string;
}) {
  const label = (phase && PHASE_LABELS[phase]) || "L'agent prépare la réponse";

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -4 }}
      className={cn("flex gap-3", className)}
    >
      <motion.div
        animate={{ scale: [1, 1.04, 1] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-surface ring-2 ring-violet-brand/20 dark:bg-surface-muted"
      >
        <Bot className="h-4 w-4 text-violet-brand" />
      </motion.div>
      <div className="rounded-3xl bg-surface px-5 py-3.5 shadow-soft ring-1 ring-border/40 dark:bg-surface-muted/80">
        <p className="flex items-center gap-1.5 text-sm text-slate-700 dark:text-slate-200">
          <span>{label}</span>
          <AnimatedDots />
        </p>
      </div>
    </motion.div>
  );
}
