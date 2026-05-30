import { useEffect, useMemo, useState } from "react";
import { FileText, RefreshCw, Search } from "lucide-react";
import { PageContainer } from "@/components/layout/PageContainer";
import { DocumentCard } from "@/components/DocumentCard";
import { UploadDocument } from "@/components/UploadDocument";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/ui/empty-state";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { deleteDocument, indexDocuments, listDocuments } from "@/services/api";
import type { DocumentItem } from "@/types";

export function Documents() {
  const [docs, setDocs] = useState<DocumentItem[]>([]);
  const [msg, setMsg] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [indexing, setIndexing] = useState(false);

  async function refresh() {
    setDocs(await listDocuments());
  }

  useEffect(() => {
    refresh().catch(() => setDocs([]));
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return docs;
    return docs.filter((d) => d.filename.toLowerCase().includes(q) || d.documentId.toLowerCase().includes(q));
  }, [docs, query]);

  return (
    <PageContainer className="space-y-8">
      <div className="grid gap-6 lg:grid-cols-2">
        <UploadDocument onUploaded={refresh} />
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Indexation du corpus</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted">
              Après upload, réindexez pour alimenter la base vectorielle. Les échantillons peuvent être chargés via le
              script de seed Python.
            </p>
            <Button
              disabled={indexing}
              variant="accent"
              onClick={async () => {
                setIndexing(true);
                try {
                  const r = await indexDocuments({ reindex_all: true });
                  setMsg(`${r.indexed} document(s) indexé(s).`);
                  await refresh();
                } catch (e) {
                  setMsg(String(e));
                } finally {
                  setIndexing(false);
                }
              }}
            >
              <RefreshCw className={`mr-2 h-4 w-4 ${indexing ? "animate-spin" : ""}`} />
              Réindexer tout
            </Button>
            {msg ? <p className="text-xs text-accent">{msg}</p> : null}
          </CardContent>
        </Card>
      </div>

      <div>
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-lg font-semibold text-foreground">Bibliothèque ({filtered.length})</h2>
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <Input
              className="pl-9"
              placeholder="Rechercher un document…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
        </div>

        {filtered.length ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filtered.map((d) => (
              <DocumentCard
                key={d.documentId}
                doc={d}
                onDelete={async (id) => {
                  await deleteDocument(id);
                  await refresh();
                }}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={FileText}
            title="Aucun document"
            description="Importez un PDF ou un fichier texte pour commencer à construire votre corpus juridique."
          />
        )}
      </div>
    </PageContainer>
  );
}
