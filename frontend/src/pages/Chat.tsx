import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { jsPDF } from "jspdf";
import { Copy, FileDown, RotateCcw } from "lucide-react";
import { AgentTypingIndicator } from "@/components/chat/AgentTypingIndicator";
import { ChatComposer } from "@/components/chat/ChatComposer";
import { MessageCard } from "@/components/chat/MessageCard";
import { ChecklistView } from "@/components/ChecklistView";
import { LegalAnswer } from "@/components/LegalAnswer";
import { PageContainer } from "@/components/layout/PageContainer";
import { Button } from "@/components/ui/button";
import { streamChat } from "@/services/api";
import type { ChatMode, ChatResponse } from "@/types";

type Turn = { role: "user" | "assistant"; text: string; data?: ChatResponse };

const CONVERSATION_STORAGE_KEY = "mourchid.conversationId";

function readStoredConversationId(): string | undefined {
  try {
    return sessionStorage.getItem(CONVERSATION_STORAGE_KEY) || undefined;
  } catch {
    return undefined;
  }
}

export function Chat() {
  const [busy, setBusy] = useState(false);
  const [turns, setTurns] = useState<Turn[]>([]);
  const [last, setLast] = useState<ChatResponse | null>(null);
  const [conversationId, setConversationId] = useState<string | undefined>(readStoredConversationId);
  const [err, setErr] = useState<string | null>(null);
  const [phase, setPhase] = useState<string | null>(null);
  const [streamingText, setStreamingText] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [turns, streamingText, phase, busy, isStreaming]);

  async function onSend(message: string, mode: ChatMode) {
    setBusy(true);
    setErr(null);
    setPhase("analyze");
    setStreamingText("");
    setIsStreaming(false);
    setTurns((t) => [...t, { role: "user", text: message }]);

    await streamChat(
      { message, mode, conversationId: conversationId || last?.conversationId || undefined },
      {
        onPhase: (p) => setPhase(p),
        onStreamStart: () => {
          setPhase(null);
          setIsStreaming(true);
        },
        onToken: (chunk) => setStreamingText((s) => s + chunk),
        onDone: (data) => {
          setLast(data);
          if (data.conversationId) {
            setConversationId(data.conversationId);
            try {
              sessionStorage.setItem(CONVERSATION_STORAGE_KEY, data.conversationId);
            } catch {
              /* ignore storage errors */
            }
          }
          setTurns((t) => [...t, { role: "assistant", text: data.answer, data }]);
          setStreamingText("");
          setIsStreaming(false);
          setPhase(null);
          setBusy(false);
        },
        onError: (msg) => {
          setErr(msg);
          setStreamingText("");
          setIsStreaming(false);
          setPhase(null);
          setBusy(false);
        },
      },
    );
  }

  function exportPdf() {
    if (!last) return;
    const doc = new jsPDF();
    doc.setFontSize(12);
    doc.text("Mourchid — ENSET Mohammedia — export", 10, 15);
    doc.setFontSize(10);
    doc.text(doc.splitTextToSize(last.answer, 180), 10, 30);
    doc.save("mourchid-reponse.pdf");
  }

  const showTyping = busy && !isStreaming;
  const showStreaming = isStreaming && streamingText.length > 0;

  return (
    <PageContainer wide flush className="h-full">
      <div className="grid h-full min-h-0 gap-3 p-3 lg:grid-cols-[minmax(0,1fr)_360px] lg:gap-4 lg:p-4">
        {/* Colonne conversation — hauteur fixe, composer collé en bas */}
        <div className="flex h-full min-h-0 flex-col overflow-hidden rounded-3xl bg-surface-muted/30 ring-1 ring-border/30">
          <div
            ref={scrollRef}
            className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-4 md:px-6 md:py-6"
          >
            {turns.length === 0 && !busy ? (
              <div className="flex min-h-full flex-col justify-center py-8">
                <div className="mx-auto w-full max-w-lg">
                  <div className="overflow-hidden rounded-3xl bg-gradient-hero p-8 text-white shadow-card">
                    <h2 className="text-2xl font-bold tracking-tight md:text-3xl">
                      Votre assistant académique ENSET propulsé par l'IA
                    </h2>
                    <p className="mt-3 text-sm text-white/85">
                      Posez une question sur la vie académique de l'ENSET — réponse sourcée, multi-agent, en streaming.
                    </p>
                    <Button
                      className="mt-6 border-0 bg-white text-slate-900 hover:bg-white/95"
                      onClick={() => document.querySelector<HTMLTextAreaElement>("textarea")?.focus()}
                    >
                      <span className="text-gradient-cta font-semibold">Commencer la conversation</span>
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="mx-auto w-full max-w-3xl space-y-5 pb-4">
                {turns.map((t, i) => (
                  <MessageCard key={i} role={t.role} content={t.text} response={t.data} />
                ))}
                <AnimatePresence mode="wait">
                  {showTyping ? <AgentTypingIndicator key="typing" phase={phase} /> : null}
                  {showStreaming ? (
                    <MessageCard key="stream" role="assistant" content={streamingText} streaming />
                  ) : null}
                </AnimatePresence>
                {err ? <p className="text-center text-sm text-danger">{err}</p> : null}
                <div ref={bottomRef} />
              </div>
            )}
          </div>
          <ChatComposer onSend={onSend} busy={busy} />
        </div>

        {/* Panneau latéral */}
        <aside className="hidden h-full min-h-0 flex-col overflow-hidden rounded-3xl ring-1 ring-border/30 lg:flex">
          <div className="shrink-0 rounded-t-3xl bg-gradient-brand px-5 py-4 shadow-soft">
            <h3 className="text-sm font-semibold text-white">Analyse & sources</h3>
            <p className="text-xs text-white/80">Citations, transparence RAG et exports</p>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain bg-surface/50 p-4 dark:bg-surface-muted/20">
            {last ? (
              <div className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  <Button size="sm" variant="outline" onClick={() => navigator.clipboard.writeText(last.answer)}>
                    <Copy className="mr-1.5 h-3.5 w-3.5" />
                    Copier
                  </Button>
                  <Button size="sm" variant="outline" onClick={exportPdf}>
                    <FileDown className="mr-1.5 h-3.5 w-3.5" />
                    PDF
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setTurns([]);
                      setLast(null);
                      setConversationId(undefined);
                      try {
                        sessionStorage.removeItem(CONVERSATION_STORAGE_KEY);
                      } catch {
                        /* ignore */
                      }
                    }}
                  >
                    <RotateCcw className="mr-1.5 h-3.5 w-3.5" />
                    Nouveau
                  </Button>
                </div>
                <LegalAnswer data={last} compact />
                {conversationId ? (
                  <div className="rounded-2xl border border-border/50 bg-surface-muted/40 px-4 py-3 text-xs">
                    <p className="font-medium text-foreground">Trace workflow sauvegardée</p>
                    <p className="mt-1 break-all font-mono text-[10px] text-muted">{conversationId}</p>
                    <Link
                      to={`/workflow?id=${encodeURIComponent(conversationId)}`}
                      className="mt-2 inline-flex text-xs font-semibold text-violet-brand hover:underline"
                    >
                      Voir le pipeline complet →
                    </Link>
                  </div>
                ) : null}
                {last.queryType === "procedure" ? <ChecklistView text={last.answer} /> : null}
              </div>
            ) : (
              <p className="text-sm text-slate-600 dark:text-slate-400">
                La réponse détaillée, les citations et la trace des agents apparaîtront ici après votre question.
              </p>
            )}
          </div>
        </aside>
      </div>
    </PageContainer>
  );
}
