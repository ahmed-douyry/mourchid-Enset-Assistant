import { useState } from "react";
import { BrowserRouter, Navigate, Route, Routes, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { PageTransition } from "@/components/ui/page-transition";
import { ThemeProvider } from "@/theme/ThemeProvider";
import { Chat } from "@/pages/Chat";
import { Quiz } from "@/pages/Quiz";
import { Dashboard } from "@/pages/Dashboard";
import { Documents } from "@/pages/Documents";
import { Home } from "@/pages/Home";
import { Summary } from "@/pages/Summary";
import { Workflow } from "@/pages/Workflow";

const PAGE_META: Record<string, { title: string; subtitle?: string }> = {
  "/": { title: "Accueil", subtitle: "Espace de recherche académique IA" },
  "/chat": { title: "Chat académique", subtitle: "Assistant multi-agent avec sources ENSET" },
  "/documents": { title: "Documents", subtitle: "Corpus académique et indexation RAG" },
  "/workflow": { title: "Workflow", subtitle: "Orchestration multi-agent" },
  "/dashboard": { title: "Dashboard", subtitle: "Vue d'ensemble du système" },
  "/quiz": { title: "Quiz concours", subtitle: "Entraînement par filière pour le concours d'accès" },
  "/summary": { title: "Résumé docs", subtitle: "Synthèse structurée de documents académiques" },
};

function pageMeta(path: string) {
  const key = Object.keys(PAGE_META).find((k) => (k === "/" ? path === "/" : path.startsWith(k)));
  return PAGE_META[key || "/"] || PAGE_META["/"];
}

function Shell() {
  const loc = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const meta = pageMeta(loc.pathname);

  return (
    <div className="shell-app flex h-full gap-3 p-3 md:gap-4 md:p-4">
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed((c) => !c)} />
      <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-3 md:gap-4">
        <Topbar title={meta.title} subtitle={meta.subtitle} />
        <main className="main-surface flex min-h-0 flex-1 flex-col overflow-hidden">
          <AnimatePresence mode="wait">
            <PageTransition key={loc.pathname}>
              <Routes location={loc}>
                <Route path="/" element={<Home />} />
                <Route path="/chat" element={<Chat />} />
                <Route path="/documents" element={<Documents />} />
                <Route path="/workflow" element={<Workflow />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/quiz" element={<Quiz />} />
                <Route path="/summary" element={<Summary />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </PageTransition>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Shell />
      </BrowserRouter>
    </ThemeProvider>
  );
}
