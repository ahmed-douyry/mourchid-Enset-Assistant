import { useEffect, useRef, useState } from "react";
import { Loader2, Mic, Send, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { VoiceVisualizer } from "@/components/chat/VoiceVisualizer";
import { transcribeAudio } from "@/services/api";
import { cn } from "@/lib/utils";
import type { ChatMode } from "@/types";

const PROMPTS = [
  "Quelles sont les filières du cycle ingénieur de l'ENSET ?",
  "Comment m'inscrire à l'ENSET Mohammedia ?",
  "Comment déposer une demande de bourse ?",
  "Quels sont les clubs de l'ENSET ?",
  "Quels sont les emplois du temps ?",
];

const MODES: { id: ChatMode; label: string }[] = [
  { id: "simple", label: "Simple" },
  { id: "detailed", label: "Détaillé" },
  { id: "technical", label: "Technique" },
  { id: "procedure", label: "Procédure" },
];

export function ChatComposer({
  onSend,
  busy,
}: {
  onSend: (msg: string, mode: ChatMode) => Promise<void>;
  busy: boolean;
}) {
  const [text, setText] = useState("");
  const [mode, setMode] = useState<ChatMode>("detailed");
  const [recording, setRecording] = useState(false);
  const [transcribing, setTranscribing] = useState(false);
  const [micSupported, setMicSupported] = useState(false);
  const [micError, setMicError] = useState<string | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);

  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    setMicSupported(
      typeof MediaRecorder !== "undefined" &&
        typeof navigator !== "undefined" &&
        !!navigator.mediaDevices?.getUserMedia,
    );
  }, []);

  function cleanupStream(s: MediaStream | null) {
    s?.getTracks().forEach((t) => t.stop());
  }

  async function startRecording() {
    if (busy) return;
    setMicError(null);
    try {
      const media = await navigator.mediaDevices.getUserMedia({ audio: true });
      setStream(media);
      chunksRef.current = [];
      const recorder = new MediaRecorder(media);
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      recorder.onstop = async () => {
        cleanupStream(media);
        setStream(null);
        const blob = new Blob(chunksRef.current, { type: recorder.mimeType || "audio/webm" });
        chunksRef.current = [];
        if (blob.size === 0) return;
        setTranscribing(true);
        try {
          const transcript = (await transcribeAudio(blob)).trim();
          if (transcript) {
            setText((prev) => (prev ? `${prev} ${transcript}` : transcript));
          } else {
            setMicError("Aucune parole détectée.");
          }
        } catch (err) {
          setMicError(err instanceof Error ? err.message : "Transcription impossible.");
        } finally {
          setTranscribing(false);
        }
      };
      recorderRef.current = recorder;
      recorder.start();
      setRecording(true);
    } catch {
      setMicError("Accès au micro refusé ou indisponible. Autorisez le microphone.");
      setRecording(false);
    }
  }

  function stopRecording() {
    const recorder = recorderRef.current;
    if (recorder && recorder.state !== "inactive") {
      recorder.stop();
    }
    setRecording(false);
  }

  function toggleRecording() {
    if (recording) {
      stopRecording();
    } else {
      void startRecording();
    }
  }

  return (
    <div className="shrink-0 space-y-3 rounded-t-3xl bg-surface/95 p-4 shadow-[0_-8px_24px_rgb(107_33_168/0.06)] backdrop-blur-md">
      <div className="flex flex-wrap gap-2">
        {PROMPTS.map((q) => (
          <button
            key={q}
            type="button"
            disabled={busy}
            onClick={() => setText(q)}
            className="rounded-full border border-violet-brand/30 bg-surface px-3 py-1.5 text-xs text-violet-brand transition hover:bg-accent-soft disabled:opacity-50"
          >
            {q}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <span className="text-[11px] font-medium uppercase tracking-wide text-muted">Niveau</span>
        {MODES.map((m) => (
          <button
            key={m.id}
            type="button"
            disabled={busy}
            onClick={() => setMode(m.id)}
            className={cn(
              "rounded-full px-3 py-1 text-xs font-medium transition",
              mode === m.id
                ? "bg-gradient-brand text-white shadow-soft"
                : "bg-surface-muted text-muted hover:text-foreground",
            )}
          >
            {m.label}
          </button>
        ))}
      </div>

      <VoiceVisualizer stream={stream} />
      {transcribing ? (
        <p className="flex items-center gap-2 text-xs font-medium text-violet-brand">
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
          Transcription en cours…
        </p>
      ) : null}
      {micError ? <p className="text-xs text-danger">{micError}</p> : null}

      <form
        className="flex items-end gap-2 rounded-2xl border border-violet-brand/20 bg-surface p-2 shadow-soft focus-within:ring-2 focus-within:ring-violet-brand/30"
        onSubmit={async (e) => {
          e.preventDefault();
          const msg = text.trim();
          if (!msg || busy) return;
          if (recording) stopRecording();
          setText("");
          await onSend(msg, mode);
        }}
      >
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          disabled={busy}
          rows={2}
          placeholder="Posez votre question académique (filières, inscription, bourse, stage…)"
          className="min-h-[52px] flex-1 resize-none bg-transparent px-3 py-2 text-sm text-foreground placeholder:text-muted focus:outline-none disabled:opacity-50"
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              e.currentTarget.form?.requestSubmit();
            }
          }}
        />
        {micSupported ? (
          <button
            type="button"
            onClick={toggleRecording}
            disabled={busy || transcribing}
            title={recording ? "Arrêter et transcrire" : "Parler (dictée vocale)"}
            aria-label={recording ? "Arrêter et transcrire" : "Parler (dictée vocale)"}
            className={cn(
              "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition disabled:opacity-50",
              recording
                ? "bg-danger text-white animate-pulse"
                : "border border-violet-brand/30 bg-surface text-violet-brand hover:bg-accent-soft",
            )}
          >
            {transcribing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mic className="h-4 w-4" />}
          </button>
        ) : null}
        <Button type="submit" disabled={busy || !text.trim()} className="h-11 shrink-0 gap-2 rounded-xl bg-gradient-brand border-0">
          {busy ? <Sparkles className="h-4 w-4 animate-pulse" /> : <Send className="h-4 w-4" />}
          Envoyer
        </Button>
      </form>
    </div>
  );
}
