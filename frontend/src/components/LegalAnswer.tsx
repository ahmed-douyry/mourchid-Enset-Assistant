import { motion } from "framer-motion";
import { ChevronDown, GitBranch } from "lucide-react";
import { useState } from "react";
import { LegalMarkdown } from "@/components/chat/LegalMarkdown";
import { ResponseMeta } from "@/components/chat/ResponseMeta";
import { SourceCard } from "@/components/SourceCard";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { ChatResponse } from "@/types";

export function LegalAnswer({ data, compact }: { data: ChatResponse; compact?: boolean }) {
  const [sourcesOpen, setSourcesOpen] = useState(true);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
      <ResponseMeta data={data} />
      {!compact && (
        <Badge variant="secondary" className="rounded-full text-[10px]">
          {data.model}
        </Badge>
      )}

      <Card className="overflow-hidden rounded-3xl border-0 ring-1 ring-border/50">
        <CardHeader className="border-b border-border/40 bg-surface-muted/30 pb-3">
          <CardTitle className="text-sm">Fiche de réponse</CardTitle>
        </CardHeader>
        <CardContent className="pt-5">
          <LegalMarkdown content={data.answer} />
        </CardContent>
      </Card>

      {data.citations?.length ? (
        <div>
          <button
            type="button"
            onClick={() => setSourcesOpen((o) => !o)}
            className="mb-3 flex w-full items-center justify-between rounded-2xl bg-surface-muted/50 px-4 py-2.5 text-sm font-semibold text-foreground"
          >
            Sources ({data.citations.length})
            <ChevronDown className={cn("h-4 w-4 transition", sourcesOpen && "rotate-180")} />
          </button>
          {sourcesOpen ? (
            <div className="grid gap-3">
              {data.citations.map((c, i) => (
                <SourceCard key={i} c={c} />
              ))}
            </div>
          ) : null}
        </div>
      ) : null}

      <Card className="rounded-3xl border-0 bg-accent-soft/30 ring-1 ring-violet-brand/10">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-sm">
            <GitBranch className="h-4 w-4 text-violet-brand" />
            Transparence RAG
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-1.5">
            {data.workflowTrace?.map((t, i) => (
              <span
                key={i}
                className="rounded-full bg-surface px-3 py-1 text-[10px] font-medium text-muted ring-1 ring-border/40"
              >
                {t.step}
              </span>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
