import type { ChatResponse, DashboardStats, DocumentItem } from "@/types";

const API = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

async function parse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const t = await res.text();
    throw new Error(t || res.statusText);
  }
  return res.json() as Promise<T>;
}

export async function postChat(body: {
  message: string;
  mode: string;
  conversationId?: string;
  textA?: string;
  textB?: string;
  contextText?: string;
}): Promise<ChatResponse> {
  const res = await fetch(`${API}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      message: body.message,
      mode: body.mode,
      conversationId: body.conversationId,
      textA: body.textA,
      textB: body.textB,
      contextText: body.contextText,
    }),
  });
  return parse<ChatResponse>(res);
}

type StreamHandlers = {
  onPhase?: (phase: string, label: string) => void;
  onToken?: (chunk: string) => void;
  onStreamStart?: () => void;
  onDone?: (data: ChatResponse) => void;
  onError?: (message: string) => void;
};

export async function streamChat(
  body: {
    message: string;
    mode: string;
    conversationId?: string;
  },
  handlers: StreamHandlers,
): Promise<void> {
  const res = await fetch(`${API}/api/chat/stream`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "text/event-stream" },
    body: JSON.stringify({
      message: body.message,
      mode: body.mode,
      conversationId: body.conversationId,
    }),
  });

  if (!res.ok) {
    const t = await res.text();
    handlers.onError?.(t || res.statusText);
    return;
  }

  const reader = res.body?.getReader();
  if (!reader) {
    handlers.onError?.("Streaming non supporté");
    return;
  }

  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";

    for (const line of lines) {
      if (!line.startsWith("data: ")) continue;
      try {
        const evt = JSON.parse(line.slice(6)) as {
          type: string;
          phase?: string;
          label?: string;
          content?: string;
          data?: ChatResponse;
          message?: string;
        };
        if (evt.type === "phase" && evt.phase) {
          handlers.onPhase?.(evt.phase, evt.label ?? "");
        } else if (evt.type === "stream_start") {
          handlers.onStreamStart?.();
        } else if (evt.type === "token" && evt.content) {
          handlers.onToken?.(evt.content);
        } else if (evt.type === "done" && evt.data) {
          handlers.onDone?.(evt.data);
        } else if (evt.type === "error") {
          handlers.onError?.(evt.message ?? "Erreur");
        }
      } catch {
        /* ignore malformed SSE */
      }
    }
  }
}

export async function getHealth() {
  const res = await fetch(`${API}/api/health`);
  return parse<{ status: string; llm: string; vectorDb: string; embeddingModel: string }>(res);
}

export async function listDocuments(): Promise<DocumentItem[]> {
  const res = await fetch(`${API}/api/documents`);
  return parse<DocumentItem[]>(res);
}

export async function uploadDocument(file: File) {
  const fd = new FormData();
  fd.append("file", file);
  const res = await fetch(`${API}/api/documents/upload`, { method: "POST", body: fd });
  return parse<{ document_id: string; filename: string; status: string }>(res);
}

export async function indexDocuments(body: { document_ids?: string[]; reindex_all?: boolean }) {
  const res = await fetch(`${API}/api/documents/index`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      document_ids: body.document_ids,
      reindex_all: body.reindex_all ?? false,
    }),
  });
  return parse<{ indexed: number }>(res);
}

export async function deleteDocument(documentId: string) {
  const res = await fetch(`${API}/api/documents/${documentId}`, { method: "DELETE" });
  return parse<{ ok: boolean }>(res);
}

export async function getWorkflowTrace(conversationId: string) {
  const res = await fetch(`${API}/api/workflow/trace/${conversationId}`);
  return parse<{ workflowTrace: unknown[]; state: Record<string, unknown> }>(res);
}

export async function postCompare(textA: string, textB: string) {
  const res = await fetch(`${API}/api/compare`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ textA, textB }),
  });
  return parse<{
    main_differences: string;
    added_obligations: string;
    removed_obligations: string;
    practical_impact: string;
  }>(res);
}

export async function postSummarize(text: string, mode: "simple" | "detailed" = "simple") {
  const res = await fetch(`${API}/api/summarize`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text, mode }),
  });
  return parse<{
    summary: string;
    key_points: string[];
    obligations: string[];
    risks: string[];
    key_articles: string[];
  }>(res);
}

export type GeneratedQuizQuestion = {
  question: string;
  options: string[];
  correctIndex: number;
  explanation?: string | null;
};

export async function generateQuiz(
  filiere: string,
  count = 5,
  difficulty: "facile" | "moyen" | "difficile" = "moyen",
): Promise<{ filiere: string; questions: GeneratedQuizQuestion[] }> {
  const res = await fetch(`${API}/api/quiz`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ filiere, count, difficulty }),
  });
  return parse<{ filiere: string; questions: GeneratedQuizQuestion[] }>(res);
}

export async function transcribeAudio(blob: Blob): Promise<string> {
  const fd = new FormData();
  const ext = blob.type.includes("ogg") ? "ogg" : blob.type.includes("wav") ? "wav" : "webm";
  fd.append("file", blob, `audio.${ext}`);
  const res = await fetch(`${API}/api/transcribe`, { method: "POST", body: fd });
  const data = await parse<{ text: string }>(res);
  return data.text;
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const res = await fetch(`${API}/api/stats/dashboard`);
  return parse<DashboardStats>(res);
}
