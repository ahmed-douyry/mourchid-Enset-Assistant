import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { AlertCircle, FileText } from "lucide-react";
import { prepareLegalMarkdown } from "@/lib/markdown";
import { cn } from "@/lib/utils";

function SectionTitle({ children }: { children?: React.ReactNode }) {
  const text = String(children ?? "").replace(/:$/, "");
  return (
    <h3 className="mb-2 mt-5 flex items-center gap-2 text-sm font-semibold text-violet-brand first:mt-0">
      <span className="h-1.5 w-1.5 rounded-full bg-gradient-brand" />
      {text}
    </h3>
  );
}

const components = {
  h1: ({ children }: { children?: React.ReactNode }) => (
    <h1 className="mb-3 text-lg font-bold tracking-tight text-foreground">{children}</h1>
  ),
  h2: ({ children }: { children?: React.ReactNode }) => (
    <h2 className="mb-2 mt-4 text-base font-bold text-foreground">{children}</h2>
  ),
  h3: SectionTitle,
  p: ({ children }: { children?: React.ReactNode }) => (
    <p className="mb-3 text-sm leading-relaxed text-foreground/95 last:mb-0">{children}</p>
  ),
  ul: ({ children }: { children?: React.ReactNode }) => (
    <ul className="legal-list mb-3 space-y-1.5 text-sm text-foreground/95">{children}</ul>
  ),
  ol: ({ children }: { children?: React.ReactNode }) => (
    <ol className="mb-3 list-decimal space-y-1.5 pl-5 text-sm text-foreground/95">{children}</ol>
  ),
  li: ({ children }: { children?: React.ReactNode }) => (
    <li className="leading-relaxed">{children}</li>
  ),
  strong: ({ children }: { children?: React.ReactNode }) => (
    <strong className="font-semibold text-foreground">{children}</strong>
  ),
  em: ({ children }: { children?: React.ReactNode }) => <em className="italic text-muted">{children}</em>,
  blockquote: ({ children }: { children?: React.ReactNode }) => (
    <div className="my-3 flex gap-2 rounded-2xl border border-violet-brand/15 bg-accent-soft/50 px-4 py-3 text-sm text-foreground dark:bg-accent-soft/20">
      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-violet-brand" />
      <div className="leading-relaxed [&>p]:mb-0">{children}</div>
    </div>
  ),
  a: ({ href, children }: { href?: string; children?: React.ReactNode }) => (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="inline-flex items-center gap-1 font-medium text-violet-brand underline decoration-violet-brand/30 underline-offset-2"
    >
      <FileText className="h-3 w-3" />
      {children}
    </a>
  ),
  code: ({ children }: { children?: React.ReactNode }) => (
    <code className="rounded-md bg-surface-muted px-1.5 py-0.5 font-mono text-xs text-violet-brand">{children}</code>
  ),
  hr: () => <hr className="my-4 border-border/60" />,
  table: () => null,
  thead: () => null,
  tbody: () => null,
  tr: () => null,
  th: () => null,
  td: () => null,
};

export function LegalMarkdown({
  content,
  className,
  streaming,
}: {
  content: string;
  className?: string;
  streaming?: boolean;
}) {
  if (streaming) {
    return (
      <div className={cn("text-sm leading-relaxed text-foreground", className)}>
        <p className="cursor-blink whitespace-pre-wrap">{stripStreamingDisplay(content)}</p>
      </div>
    );
  }

  const prepared = prepareLegalMarkdown(content);

  return (
    <div className={cn("legal-markdown max-w-none", className)}>
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {prepared}
      </ReactMarkdown>
    </div>
  );
}

function stripStreamingDisplay(text: string): string {
  return text
    .replace(/\|/g, " ")
    .replace(/^[-:]+$/gm, "")
    .replace(/\*\*/g, "")
    .replace(/<br\s*\/?>/gi, "\n");
}
