import { motion } from "framer-motion";
import { CheckCircle2, Circle, Loader2 } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { WorkflowTraceItem } from "@/types";
import { cn } from "@/lib/utils";

const STEP_LABELS: Record<string, string> = {
  classifyQuery: "1. Analyse & classification de la demande",
  retrieveDocuments: "2. Recherche dans le corpus ENSET (RAG)",
  rerankDocuments: "3. Tri & sélection des passages pertinents",
  routeToSpecializedAgent: "4. Orientation vers l'agent spécialisé",
  academicAnswer: "5. Rédaction de la réponse académique",
  procedureAnalysis: "5. Analyse de la démarche administrative",
  summaryAnalysis: "5. Synthèse du document",
  comparisonAnalysis: "5. Comparaison des filières / documents",
  citationGeneration: "6. Génération des citations & sources",
  verification: "7. Vérification anti-hallucination",
  finalResponse: "8. Réponse finale",
};

function stepLabel(step: string): string {
  return STEP_LABELS[step] || step;
}

export function WorkflowViewer({ trace }: { trace: WorkflowTraceItem[] }) {
  if (!trace.length) {
    return (
      <div className="flex h-[420px] items-center justify-center rounded-2xl border border-dashed border-border text-sm text-muted">
        Chargez une trace pour visualiser le pipeline
      </div>
    );
  }

  return (
    <ScrollArea className="h-[420px] rounded-2xl border border-border bg-surface p-4">
      <ol className="relative space-y-0">
        {trace.map((t, i) => {
          const isLast = i === trace.length - 1;
          const done = !isLast;
          return (
            <li key={i} className="relative flex gap-4 pb-8 last:pb-0">
              {!isLast ? <span className="absolute left-[11px] top-6 h-full w-px bg-border" /> : null}
              <div
                className={cn(
                  "relative z-10 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border",
                  done ? "border-success bg-success/10 text-success" : "border-accent bg-accent-soft text-accent",
                )}
              >
                {done ? (
                  <CheckCircle2 className="h-3.5 w-3.5" />
                ) : isLast ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Circle className="h-3.5 w-3.5" />
                )}
              </div>
              <motion.div
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="min-w-0 flex-1 rounded-xl border border-border bg-surface-muted/40 p-3"
              >
                <p className="text-sm font-semibold text-foreground">{stepLabel(t.step)}</p>
                {t.detail ? <p className="mt-1 text-xs text-muted">{t.detail}</p> : null}
              </motion.div>
            </li>
          );
        })}
      </ol>
    </ScrollArea>
  );
}
