import { useCallback, useState } from "react";
import { motion } from "framer-motion";
import { FileUp, Upload } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusPill } from "@/components/ui/status-pill";
import { uploadDocument } from "@/services/api";
import { cn } from "@/lib/utils";

export function UploadDocument({ onUploaded }: { onUploaded: () => void }) {
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [drag, setDrag] = useState(false);

  const onFile = useCallback(
    async (f: File | null) => {
      if (!f) return;
      setBusy(true);
      setMsg(null);
      try {
        await uploadDocument(f);
        setMsg(`${f.name} importé avec succès.`);
        onUploaded();
      } catch (e) {
        setMsg(String(e));
      } finally {
        setBusy(false);
      }
    },
    [onUploaded],
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Upload className="h-4 w-4 text-accent" />
          Importer un document
        </CardTitle>
      </CardHeader>
      <CardContent>
        <label
          className={cn(
            "flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 py-12 transition",
            drag ? "border-accent bg-accent-soft/40" : "border-border bg-surface-muted/30 hover:border-accent/50",
            busy && "pointer-events-none opacity-60",
          )}
          onDragOver={(e) => {
            e.preventDefault();
            setDrag(true);
          }}
          onDragLeave={() => setDrag(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDrag(false);
            onFile(e.dataTransfer.files?.[0] || null);
          }}
        >
          <input
            type="file"
            className="hidden"
            accept="application/pdf,.pdf,.md,.txt"
            disabled={busy}
            onChange={(e) => onFile(e.target.files?.[0] || null)}
          />
          <motion.div
            animate={drag ? { scale: 1.05 } : { scale: 1 }}
            className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-accent-soft text-accent"
          >
            <FileUp className="h-7 w-7" />
          </motion.div>
          <p className="text-sm font-medium text-foreground">Glissez-déposez ou cliquez pour parcourir</p>
          <p className="mt-1 text-xs text-muted">PDF, Markdown, texte</p>
          {busy ? <StatusPill label="Upload en cours…" status="running" className="mt-4" /> : null}
          {msg ? <p className="mt-3 text-xs text-muted">{msg}</p> : null}
        </label>
      </CardContent>
    </Card>
  );
}
