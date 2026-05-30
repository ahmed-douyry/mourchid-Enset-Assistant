import { useEffect, useState } from "react";
import { Activity, CheckCircle2, FileStack, MessageCircle } from "lucide-react";
import { PageContainer } from "@/components/layout/PageContainer";
import { StatCard } from "@/components/dashboard/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getDashboardStats, getHealth } from "@/services/api";
import type { DashboardStats } from "@/types";

export function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [health, setHealth] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const s = await getDashboardStats();
        setStats(s);
        const h = await getHealth();
        setHealth(`${h.llm} · ${h.vectorDb} · ${h.embeddingModel}`);
      } catch {
        setStats(null);
      }
    })();
  }, []);

  const domains = Object.entries(stats?.topDomains || {}).sort((a, b) => b[1] - a[1]);

  return (
    <PageContainer className="space-y-8">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Documents indexés" value={stats?.documentsIndexed ?? "—"} icon={FileStack} accent="primary" />
        <StatCard label="Questions posées" value={stats?.questionsAsked ?? "—"} icon={MessageCircle} accent="accent" />
        <StatCard
          label="Taux vérifiés"
          value={stats ? `${Math.round(stats.verifiedRate * 100)}%` : "—"}
          icon={CheckCircle2}
          accent="gold"
        />
        <StatCard label="Modèle LLM" value={stats?.llmModel?.split(":")[0] ?? "—"} hint={health} icon={Activity} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="h-full">
          <CardHeader>
            <CardTitle>Domaines les plus demandés</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {domains.length ? (
              domains.map(([domain, count]) => {
                const max = domains[0][1] || 1;
                return (
                  <div key={domain}>
                    <div className="mb-1 flex justify-between text-xs">
                      <span className="font-medium text-slate-900 dark:text-slate-100">{domain}</span>
                      <span className="text-slate-600 dark:text-slate-400">{count}</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-surface-muted">
                      <div
                        className="h-full rounded-full bg-gradient-progress"
                        style={{ width: `${(count / max) * 100}%` }}
                      />
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-sm text-slate-600 dark:text-slate-400">Aucune donnée disponible.</p>
            )}
          </CardContent>
        </Card>

        <Card className="h-full">
          <CardHeader>
            <CardTitle>Santé du système</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex flex-wrap gap-2">
              <Badge variant="success">API</Badge>
              <Badge variant="secondary">{stats?.vectorDb ?? "—"}</Badge>
              <Badge variant="outline">{stats?.embeddingModel ?? "—"}</Badge>
            </div>
            <p className="text-slate-600 dark:text-slate-400">{health || "Chargement…"}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Activité récente</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {(stats?.lastQueries || []).length ? (
            stats!.lastQueries.map((q, i) => (
              <div
                key={i}
                className="flex items-start gap-3 rounded-xl bg-surface-muted/50 p-3 text-sm ring-1 ring-border/30"
              >
                <Badge variant="outline" className="shrink-0 capitalize">
                  {q.type}
                </Badge>
                <span className="text-slate-900 dark:text-slate-100">{q.query}</span>
              </div>
            ))
          ) : (
            <p className="text-sm text-slate-600 dark:text-slate-400">Aucune recherche récente.</p>
          )}
        </CardContent>
      </Card>
    </PageContainer>
  );
}
