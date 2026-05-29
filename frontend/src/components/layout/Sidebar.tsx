import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookOpen,
  ChevronLeft,
  ChevronRight,
  FileText,
  GitBranch,
  GraduationCap,
  LayoutDashboard,
  ListChecks,
  MessageSquare,
} from "lucide-react";
import { BrandLogo } from "@/components/brand/BrandLogo";
import { cn } from "@/lib/utils";

const links = [
  { to: "/", label: "Accueil", icon: GraduationCap },
  { to: "/chat", label: "Assistant", icon: MessageSquare },
  { to: "/documents", label: "Documents", icon: FileText },
  { to: "/workflow", label: "Workflow agents", icon: GitBranch },
  { to: "/dashboard", label: "Tableau de bord", icon: LayoutDashboard },
  { to: "/quiz", label: "Quiz concours", icon: ListChecks },
  { to: "/summary", label: "Résumé docs", icon: BookOpen },
];

export function Sidebar({ collapsed, onToggle }: { collapsed: boolean; onToggle: () => void }) {
  const loc = useLocation();

  return (
    <aside
      className={cn(
        "sidebar-panel hidden shrink-0 flex-col transition-[width] duration-300 md:flex",
        collapsed ? "w-[76px]" : "w-[248px]",
      )}
    >
      <div className={cn("border-b border-border/30 pb-4 pt-4", collapsed ? "px-2" : "px-3")}>
        <AnimatePresence mode="wait">
          <motion.div
            key={collapsed ? "icon" : "full"}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={cn("flex w-full", collapsed ? "justify-center" : "justify-start")}
          >
            <BrandLogo variant={collapsed ? "icon" : "full"} to="/" />
          </motion.div>
        </AnimatePresence>
      </div>

      <nav className="flex-1 space-y-1.5 px-3">
        {links.map((l) => {
          const active = loc.pathname === l.to;
          const Icon = l.icon;
          return (
            <Link
              key={l.to}
              to={l.to}
              title={l.label}
              className={cn(
                "relative flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                active
                  ? "text-white shadow-soft"
                  : "text-muted hover:bg-white/60 hover:text-foreground dark:hover:bg-white/5",
              )}
            >
              {active ? (
                <motion.span
                  layoutId="nav-active"
                  className="absolute inset-0 rounded-2xl bg-gradient-brand"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              ) : null}
              <Icon className={cn("relative z-10 h-4 w-4 shrink-0", active && "text-white")} />
              {!collapsed ? <span className="relative z-10 truncate">{l.label}</span> : null}
            </Link>
          );
        })}
      </nav>

      <div className="p-3 pt-2">
        <button
          type="button"
          onClick={onToggle}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-white/50 px-3 py-2.5 text-xs font-medium text-muted shadow-soft transition hover:bg-white/80 hover:text-foreground dark:bg-white/5 dark:hover:bg-white/10"
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          {!collapsed ? "Réduire" : null}
        </button>
      </div>
    </aside>
  );
}
