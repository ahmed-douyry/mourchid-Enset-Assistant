import { motion } from "framer-motion";
import { FileText, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusPill } from "@/components/ui/status-pill";
import { Button } from "@/components/ui/button";
import type { DocumentItem } from "@/types";

function statusVariant(status: string): "done" | "running" | "error" | "idle" {
  if (status === "indexed") return "done";
  if (status === "processing") return "running";
  if (status === "error") return "error";
  return "idle";
}

export function DocumentCard({ doc, onDelete }: { doc: DocumentItem; onDelete: (id: string) => void }) {
  return (
    <motion.div whileHover={{ y: -2 }} transition={{ duration: 0.2 }}>
      <Card>
        <CardHeader className="flex flex-row items-start justify-between gap-2 pb-2">
          <div className="flex min-w-0 gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <FileText className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <CardTitle className="truncate text-base">{doc.filename}</CardTitle>
              <p className="mt-0.5 truncate text-[11px] text-muted">{doc.documentId}</p>
            </div>
          </div>
          <StatusPill label={doc.status} status={statusVariant(doc.status)} />
        </CardHeader>
        <CardContent className="flex items-center justify-between">
          <span className="text-sm text-muted">{doc.chunkCount} chunks indexés</span>
          <Button
            variant="ghost"
            size="sm"
            className="text-danger hover:bg-danger/10 hover:text-danger"
            onClick={() => onDelete(doc.documentId)}
          >
            <Trash2 className="mr-1 h-3.5 w-3.5" />
            Supprimer
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}
