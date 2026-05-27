export type ChatMode = "simple" | "detailed" | "technical" | "procedure";

export interface CitationItem {
  document_title?: string | null;
  article_number?: string | null;
  source?: string | null;
  excerpt?: string | null;
  relevance_score?: number | null;
  official_hint?: string | null;
}

export interface WorkflowTraceItem {
  step: string;
  detail?: string | null;
  payload?: Record<string, unknown> | null;
}

export interface ChatResponse {
  answer: string;
  queryType: string;
  citations: CitationItem[];
  confidenceScore: number;
  workflowTrace: WorkflowTraceItem[];
  model: string;
  sourcePolicy: string;
  conversationId?: string | null;
}

export interface DocumentItem {
  documentId: string;
  filename: string;
  status: string;
  metadata: Record<string, unknown>;
  chunkCount: number;
}

export interface DashboardStats {
  documentsIndexed: number;
  questionsAsked: number;
  topDomains: Record<string, number>;
  verifiedRate: number;
  lastQueries: { query: string; type: string }[];
  llmModel: string;
  vectorDb: string;
  embeddingModel: string;
}
