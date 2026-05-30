import { motion } from "framer-motion";
import { FileText } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { CitationItem } from "@/types";

export function SourceCard({ c }: { c: CitationItem }) {
  return (
    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>
      <Card className="hover:border-accent/30">
        <CardHeader className="pb-2">
          <div className="flex items-start gap-2">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent-soft text-accent">
              <FileText className="h-4 w-4" />
            </div>
            <div className="min-w-0 flex-1">
              <CardTitle className="text-sm">{c.document_title || "Document"}</CardTitle>
              <p className="mt-0.5 text-xs text-muted">
                {c.article_number ? `Art. ${c.article_number}` : null}
                {c.source ? ` · ${c.source}` : null}
              </p>
            </div>
            {typeof c.relevance_score === "number" ? (
              <Badge variant="secondary">{Math.round(c.relevance_score * 100)}%</Badge>
            ) : null}
          </div>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          {c.excerpt ? (
            <p className="whitespace-pre-wrap rounded-lg bg-surface-muted/60 p-3 text-foreground">{c.excerpt}</p>
          ) : null}
          {c.official_hint ? (
            <p className="text-xs text-accent">Source officielle : {c.official_hint}</p>
          ) : null}
        </CardContent>
      </Card>
    </motion.div>
  );
}
