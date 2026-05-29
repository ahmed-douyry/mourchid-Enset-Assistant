import { Moon, Sun } from "lucide-react";
import { motion } from "framer-motion";
import { BrandLogo } from "@/components/brand/BrandLogo";
import {
  BRAND_NAME,
  UH2C_LABEL,
  UH2C_LOGO_SRC,
} from "@/lib/brand";
import { useTheme } from "@/theme/ThemeProvider";
import { cn } from "@/lib/utils";

function InstitutionLogos() {
  return (
    <div className="hidden items-center rounded-2xl bg-white px-3 py-1.5 shadow-soft ring-1 ring-border/40 lg:flex">
      <img
        src={UH2C_LOGO_SRC}
        alt={UH2C_LABEL}
        title={UH2C_LABEL}
        className="h-16 w-auto max-w-[140px] object-contain"
        height={64}
        decoding="async"
      />
    </div>
  );
}

export function Topbar({ title, subtitle }: { title: string; subtitle?: string }) {
  const { theme, toggle } = useTheme();

  return (
    <header className="topbar-capsule flex shrink-0 items-center justify-between gap-4 px-5 py-3 md:px-6">
      <div className="flex min-w-0 items-center gap-4">
        <BrandLogo variant="icon" to="/" className="hidden shrink-0 sm:flex" />
        <div className="min-w-0">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-violet-700 dark:text-violet-300">
          {BRAND_NAME}
        </p>
        <motion.h1
          key={title}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          className="truncate text-lg font-semibold tracking-tight text-slate-900 dark:text-slate-50 md:text-xl"
        >
          {title}
        </motion.h1>
        {subtitle ? <p className="truncate text-xs text-slate-600 dark:text-slate-400">{subtitle}</p> : null}
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-3">
        <InstitutionLogos />
        <button
          type="button"
          onClick={toggle}
          className={cn(
            "flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-sm font-medium shadow-soft transition",
            "bg-surface/90 text-foreground ring-1 ring-border/50 hover:ring-violet-brand/30",
          )}
        >
          <motion.span key={theme} initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} className="flex items-center gap-2">
            {theme === "dark" ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4 text-violet-brand" />}
            <span className="hidden sm:inline">{theme === "dark" ? "Clair" : "Sombre"}</span>
          </motion.span>
        </button>
      </div>
    </header>
  );
}
