import { motion } from "framer-motion";
import { Bot, User } from "lucide-react";
import { LegalMarkdown } from "@/components/chat/LegalMarkdown";
import { ResponseMeta } from "@/components/chat/ResponseMeta";
import { cn } from "@/lib/utils";
import type { ChatResponse } from "@/types";

export function MessageCard({
  role,
  content,
  response,
  streaming,
}: {
  role: "user" | "assistant";
  content: string;
  response?: ChatResponse | null;
  streaming?: boolean;
}) {
  const isUser = role === "user";

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn("flex gap-3", isUser ? "flex-row-reverse" : "flex-row")}
    >
      <div
        className={cn(
          "flex h-9 w-9 shrink-0 items-center justify-center rounded-full shadow-soft ring-2 ring-white/20",
          isUser ? "bg-gradient-brand text-white" : "bg-surface text-violet-brand ring-border/30",
        )}
      >
        {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
      </div>

      <div className={cn("flex max-w-[min(100%,720px)] flex-col gap-2", isUser ? "items-end" : "items-start")}>
        <div
          className={cn(
            "w-full rounded-3xl px-5 py-4 shadow-soft",
            isUser
              ? "bg-gradient-user text-white"
              : "bg-surface ring-1 ring-border/40 dark:bg-surface-muted/80",
          )}
        >
          {isUser ? (
            <p className="text-sm leading-relaxed">{content}</p>
          ) : (
            <LegalMarkdown content={content} streaming={streaming} />
          )}
        </div>
        {response && !isUser && !streaming ? <ResponseMeta data={response} /> : null}
      </div>
    </motion.div>
  );
}
