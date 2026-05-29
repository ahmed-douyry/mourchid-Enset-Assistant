import { cn } from "@/lib/utils";

export function PageContainer({
  children,
  className,
  wide,
  flush,
}: {
  children: React.ReactNode;
  className?: string;
  wide?: boolean;
  flush?: boolean;
}) {
  return (
    <div
      className={cn(
        "w-full",
        flush
          ? "flex h-full min-h-0 flex-1 flex-col overflow-hidden"
          : "min-h-0 flex-1 flex-col overflow-y-auto overflow-x-hidden",
        !flush && "px-5 py-6 md:px-8 md:py-8",
        wide ? "max-w-none" : !flush && "mx-auto max-w-7xl",
        className,
      )}
    >
      {children}
    </div>
  );
}
