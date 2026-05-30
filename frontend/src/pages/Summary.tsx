import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, BookOpen, FileText, ListChecks, Scale, Sparkles } from "lucide-react";
import { PageContainer } from "@/components/layout/PageContainer";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { postSummarize } from "@/services/api";

type SummaryData = {
  summary: string;
  key_points: string[];
  obligations: string[];
  risks: string[];
  key_articles: string[];
};

function Block({
  icon: Icon,
  title,
  items,
  accent,
}: {
  icon: typeof BookOpen;
  title: string;
  items: string[];
  accent: string;
}) {
  if (!items.length) return null;
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-sm">
          <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${accent}`}>
            <Icon className="h-4 w-4" />
          </div>
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2">
          {items.map((item, i) => (
            <li key={i} className="flex gap-2 text-sm text-foreground">
              <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-accent" />
              {item}
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}

export function Summary() {
  const [text, setText] = useState("");
  const [data, setData] = useState<SummaryData | null>(null);
  const [busy, setBusy] = useState(false);

  return (
    <PageContainer className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Texte à analyser</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            className="min-h-[220px]"
            placeholder="Collez un document académique ENSET (règlement, guide d'inscription, descriptif de filière…)"
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <Button
            disabled={busy || !text.trim()}
            className="gap-2"
            onClick={async () => {
              setBusy(true);
              setData(null);
              try {
                setData(await postSummarize(text, "simple"));
              } finally {
                setBusy(false);
              }
            }}
          >
            {busy ? <Sparkles className="h-4 w-4 animate-pulse" /> : <BookOpen className="h-4 w-4" />}
            Générer le résumé structuré
          </Button>
        </CardContent>
      </Card>

      <AnimatePresence mode="wait">
        {busy ? (
          <motion.div key="sk" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid gap-4 md:grid-cols-2">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i}>
                <CardContent className="space-y-2 p-6">
                  <Skeleton className="h-4 w-1/3" />
                  <Skeleton className="h-20 w-full" />
                </CardContent>
              </Card>
            ))}
          </motion.div>
        ) : data ? (
          <motion.div
            key="res"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <Card className="border-accent/20 bg-gradient-to-br from-surface to-accent-soft/20">
              <CardHeader>
                <CardTitle>Résumé global</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-relaxed text-foreground">{data.summary}</p>
              </CardContent>
            </Card>
            <div className="grid gap-4 md:grid-cols-2">
              <Block icon={ListChecks} title="Points clés" items={data.key_points} accent="bg-accent-soft text-accent" />
              <Block icon={Scale} title="Démarches / conditions" items={data.obligations} accent="bg-primary/10 text-primary" />
              <Block icon={AlertTriangle} title="Points d'attention" items={data.risks} accent="bg-warning/10 text-warning" />
              <Block icon={FileText} title="Échéances / références" items={data.key_articles} accent="bg-gold-soft/15 text-gold-soft" />
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </PageContainer>
  );
}
