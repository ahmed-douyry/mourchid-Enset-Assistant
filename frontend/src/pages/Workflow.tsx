import { useState } from "react";
import { GitBranch, Search } from "lucide-react";
import { PageContainer } from "@/components/layout/PageContainer";
import { WorkflowViewer } from "@/components/WorkflowViewer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusPill } from "@/components/ui/status-pill";
import { getWorkflowTrace } from "@/services/api";
import type { WorkflowTraceItem } from "@/types";

export function Workflow() {
  const [id, setId] = useState("");
  const [trace, setTrace] = useState<WorkflowTraceItem[]>([]);
  const [logs, setLogs] = useState("");
  const [loading, setLoading] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const data = await getWorkflowTrace(id.trim());
      setTrace((data.workflowTrace || []) as WorkflowTraceItem[]);
      setLogs(JSON.stringify(data.state || {}, null, 2).slice(0, 8000));
    } catch (e) {
      setLogs(String(e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <PageContainer className="space-y-6">
      

      <div className="flex flex-col gap-3 sm:flex-row">
        <Input placeholder="conversationId" value={id} onChange={(e) => setId(e.target.value)} className="flex-1" />
        <Button onClick={() => load()} disabled={loading || !id.trim()} className="gap-2">
          <Search className="h-4 w-4" />
          {loading ? "Chargement…" : "Charger la trace"}
        </Button>
      </div>

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
