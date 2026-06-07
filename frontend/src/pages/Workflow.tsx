import { useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { GitBranch, RefreshCw, Search } from "lucide-react";
import { PageContainer } from "@/components/layout/PageContainer";
import { WorkflowViewer } from "@/components/WorkflowViewer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getWorkflowTrace, listWorkflowTraces, type WorkflowTraceSummary } from "@/services/api";
import type { WorkflowTraceItem } from "@/types";

function parseApiError(raw: unknown): string {
  if (raw instanceof Error) {
    try {
      const parsed = JSON.parse(raw.message) as { detail?: string };
      if (parsed.detail) return parsed.detail;
    } catch {
      /* not JSON */
    }
    return raw.message;
  }
  return String(raw);
}

export function Workflow() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [id, setId] = useState(searchParams.get("id") ?? "");
  const [trace, setTrace] = useState<WorkflowTraceItem[]>([]);
  const [logs, setLogs] = useState("");
  const [loading, setLoading] = useState(false);
  const [recent, setRecent] = useState<WorkflowTraceSummary[]>([]);
  const [recentLoading, setRecentLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const loadedIdRef = useRef<string | null>(null);

  const refreshRecent = useCallback(async () => {
    setRecentLoading(true);
    try {
      const items = await listWorkflowTraces();
      setRecent(items);
    } catch (e) {
      setError(parseApiError(e));
    } finally {
      setRecentLoading(false);
    }
  }, []);

  const load = useCallback(async (conversationId?: string) => {
    const target = (conversationId ?? id).trim();
    if (!target) return;
    setLoading(true);
    setError(null);
    try {
      const data = await getWorkflowTrace(target);
      setTrace((data.workflowTrace || []) as WorkflowTraceItem[]);
      setLogs(JSON.stringify(data.state || {}, null, 2).slice(0, 8000));
      setId(target);
      loadedIdRef.current = target;
      if (searchParams.get("id") !== target) {
        setSearchParams({ id: target }, { replace: true });
      }
    } catch (e) {
      setTrace([]);
      setLogs("");
      setError(parseApiError(e));
    } finally {
      setLoading(false);
    }
  }, [id, searchParams, setSearchParams]);

  useEffect(() => {
    void refreshRecent();
  }, [refreshRecent]);

  useEffect(() => {
    const fromUrl = searchParams.get("id")?.trim();
    if (!fromUrl || loadedIdRef.current === fromUrl) return;
    setId(fromUrl);
    void load(fromUrl);
  }, [searchParams, load]);

  return (
    <PageContainer className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row">
        <Input
          placeholder="conversationId (UUID)"
          value={id}
          onChange={(e) => setId(e.target.value)}
          className="flex-1 font-mono text-xs"
        />
        <Button onClick={() => load()} disabled={loading || !id.trim()} className="gap-2">
          <Search className="h-4 w-4" />
          {loading ? "Chargement…" : "Charger la trace"}
        </Button>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
          <CardTitle className="flex items-center gap-2 text-sm">
            <GitBranch className="h-4 w-4 text-violet-brand" />
            Traces sauvegardées
          </CardTitle>
          <Button size="sm" variant="ghost" onClick={() => refreshRecent()} disabled={recentLoading} className="gap-1.5">
            <RefreshCw className={`h-3.5 w-3.5 ${recentLoading ? "animate-spin" : ""}`} />
            Actualiser
          </Button>
        </CardHeader>
        <CardContent>
          {recent.length === 0 && !recentLoading ? (
            <p className="text-sm text-muted">
              Aucune trace enregistrée. Posez une question dans le chat : la trace est sauvegardée automatiquement
              à la fin de chaque réponse.
            </p>
          ) : (
            <div className="flex flex-col gap-2">
              {recent.map((item) => (
                <button
                  key={item.conversationId}
                  type="button"
                  onClick={() => load(item.conversationId)}
                  className="flex w-full flex-col gap-1 rounded-xl border border-border bg-surface-muted/30 px-4 py-3 text-left transition hover:bg-surface-muted/60"
                >
                  <span className="font-mono text-[11px] text-muted">{item.conversationId}</span>
                  <span className="text-sm text-foreground">
                    {item.queryPreview || "Conversation sans aperçu"}
                  </span>
                  <span className="text-[11px] text-muted">
                    {item.queryType ? `${item.queryType} · ` : ""}
                    {item.stepCount ?? 0} étape{(item.stepCount ?? 0) > 1 ? "s" : ""}
                  </span>
                </button>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {error ? (
        <p className="rounded-xl bg-danger/10 px-4 py-3 text-sm text-danger">{error}</p>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-2">
        <div>
          <h3 className="mb-3 text-sm font-semibold text-foreground">Pipeline d'exécution</h3>
          <WorkflowViewer trace={trace} />
        </div>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">État technique (aperçu)</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="max-h-[420px] overflow-auto rounded-xl bg-primary p-4 font-mono text-[11px] leading-relaxed text-primary-foreground">
              {logs || "—"}
            </pre>
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
}
