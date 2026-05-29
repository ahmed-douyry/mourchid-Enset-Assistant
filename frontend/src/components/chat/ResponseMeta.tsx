import { ConfidenceBadge } from "@/components/ConfidenceBadge";
import { Badge } from "@/components/ui/badge";
import type { ChatResponse } from "@/types";

export function ResponseMeta({ data, className }: { data: ChatResponse; className?: string }) {
  return (
    <div className={`flex flex-wrap items-center gap-2 ${className ?? ""}`}>
      <Badge variant="outline" className="rounded-full capitalize">
        {data.queryType}
      </Badge>
      <ConfidenceBadge score={data.confidenceScore} />
    </div>
  );
}
