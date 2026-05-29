import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Brain, FileSearch, GitMerge, ShieldCheck, Sparkles } from "lucide-react";
import { StatusPill } from "@/components/ui/status-pill";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const STEPS = [
  { id: "analyze", label: "Analyse de votre question…", icon: Brain },
  { id: "search", label: "Recherche dans les documents indexés…", icon: FileSearch },
  { id: "agents", label: "Coordination des agents…", icon: GitMerge },
  { id: "verify", label: "Vérification des sources…", icon: ShieldCheck },
  { id: "synth", label: "Synthèse de la réponse…", icon: Sparkles },
] as const;

const AGENTS = [
  { name: "Superviseur", role: "Classification de la requête" },
  { name: "Recherche documentaire", role: "Récupération RAG" },
  { name: "Raisonnement juridique", role: "Analyse du droit applicable" },
  { name: "Citations", role: "Ancrage des sources" },
  { name: "Vérification", role: "Contrôle de cohérence" },
];

export function AgentProcessingPanel({ active, phase }: { active: boolean; phase?: string | null }) {
  const [agentIndex, setAgentIndex] = useState(0);

  const stepIndex = phase ? Math.max(0, STEPS.findIndex((s) => s.id === phase)) : 0;
  const current = STEPS[stepIndex] ?? STEPS[0];

  useEffect(() => {
    if (!active) {
      setAgentIndex(0);
      return;
    }
    const agentTimer = setInterval(() => {
      setAgentIndex((i) => (i < AGENTS.length - 1 ? i + 1 : i));
    }, 1800);
    return () => clearInterval(agentTimer);
  }, [active]);

  if (!active) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="space-y-4"
    >
      <Card className="overflow-hidden border-violet-brand/25 bg-gradient-to-br from-accent-soft/80 via-surface to-surface">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-sm font-semibold">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-violet-brand opacity-50" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-violet-brand" />
            </span>
            Traitement multi-agent en cours
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <current.icon className="h-5 w-5 text-violet-brand" />
            <p className="text-sm font-medium text-foreground">{current.label}</p>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-surface-muted">
            <motion.div
              className="h-full rounded-full bg-gradient-progress"
              initial={{ width: "8%" }}
              animate={{ width: `${((stepIndex + 1) / STEPS.length) * 100}%` }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            />
          </div>
          <ol className="grid gap-2 sm:grid-cols-2">
            {STEPS.map((s, i) => (
              <li
                key={s.id}
                className={`flex items-center gap-2 rounded-lg px-2 py-1.5 text-xs ${
                  i < stepIndex ? "text-success" : i === stepIndex ? "text-foreground" : "text-muted"
                }`}
              >
                <s.icon className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">{s.label.replace("…", "")}</span>
                {i < stepIndex ? (
                  <StatusPill label="OK" status="done" className="ml-auto shrink-0" />
                ) : i === stepIndex ? (
                  <StatusPill label="En cours" status="running" className="ml-auto shrink-0" />
                ) : (
                  <StatusPill label="Attente" status="idle" className="ml-auto shrink-0" />
                )}
              </li>
            ))}
          </ol>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-xs font-semibold uppercase tracking-wide text-muted">Orchestration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {AGENTS.map((a, i) => (
            <div
              key={a.name}
              className="flex items-center justify-between rounded-xl border border-border bg-surface-muted/40 px-3 py-2"
            >
              <div>
                <p className="text-xs font-medium text-foreground">{a.name}</p>
                <p className="text-[10px] text-muted">{a.role}</p>
              </div>
              <StatusPill
                label={i < agentIndex ? "Terminé" : i === agentIndex ? "En cours" : "En attente"}
                status={i < agentIndex ? "done" : i === agentIndex ? "running" : "idle"}
              />
            </div>
          ))}
        </CardContent>
      </Card>
    </motion.div>
  );
}
