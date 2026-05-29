import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { BRAND_ICON_SRC, BRAND_LOGO_SRC, BRAND_NAME, BRAND_TAGLINE } from "@/lib/brand";

type BrandLogoProps = {
  variant?: "full" | "icon";
  className?: string;
  to?: string | null;
  showTagline?: boolean;
};

export function BrandLogo({
  variant = "full",
  className,
  to = "/",
  showTagline = false,
}: BrandLogoProps) {
  const img =
    variant === "icon" ? (
      <span className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-white p-1.5 shadow-card ring-1 ring-violet-brand/15 dark:bg-slate-900/80">
        <img
          src={BRAND_ICON_SRC}
          alt={BRAND_NAME}
          className="h-full w-full object-contain object-center"
          width={40}
          height={40}
          decoding="async"
        />
      </span>
    ) : (
      <span className="flex w-full items-center justify-center rounded-2xl bg-white px-3 py-3 shadow-card ring-1 ring-violet-brand/10">
        <img
          src={BRAND_LOGO_SRC}
          alt={BRAND_NAME}
          className="h-auto w-full max-w-full object-contain object-center"
          decoding="async"
        />
      </span>
    );

  const wrapClass = cn(
    "flex min-w-0 items-center gap-3 rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-violet-brand/40",
    variant === "full" && "w-full",
    variant === "full" && showTagline && "flex-col items-start gap-1",
    className,
  );

  const inner = (
    <>
      {img}
      {variant === "full" && showTagline ? (
        <p className="truncate text-[11px] text-muted">{BRAND_TAGLINE}</p>
      ) : null}
    </>
  );

  if (to) {
    return (
      <Link to={to} className={wrapClass} aria-label={`${BRAND_NAME} — accueil`}>
        {inner}
      </Link>
    );
  }

  return <div className={wrapClass}>{inner}</div>;
}

