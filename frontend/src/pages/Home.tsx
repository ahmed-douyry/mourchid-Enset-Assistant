import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowRight,
  BookOpen,
  FileText,
  GitBranch,
  MessageSquare,
  Scale,
  Shield,
  Sparkles,
  Upload,
} from "lucide-react";
import { PageContainer } from "@/components/layout/PageContainer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BrandLogo } from "@/components/brand/BrandLogo";
import { BRAND_NAME } from "@/lib/brand";
import { Badge } from "@/components/ui/badge";

const features = [
  { icon: MessageSquare, title: "Recherche académique IA", desc: "Questions en langage naturel avec réponses sourcées sur l'ENSET." },
  { icon: FileText, title: "Documentation pédagogique", desc: "Filières, inscriptions, bourses et règlements indexés localement." },
  { icon: GitBranch, title: "Workflow multi-agent", desc: "Transparence sur l'orchestration LangGraph." },
  { icon: Scale, title: "Comparaison de filières", desc: "Différences entre cursus, débouchés et conditions d'accès." },
  { icon: BookOpen, title: "Résumés structurés", desc: "Points clés, démarches et échéances extraits des documents." },
  { icon: Shield, title: "Local-first", desc: "Open-source, déployable on-premise pour la confidentialité." },
];

const quickActions = [
  { to: "/chat", label: "Poser une question", icon: MessageSquare },
  { to: "/documents", label: "Importer un document", icon: Upload },
  { to: "/workflow", label: "Voir le workflow", icon: GitBranch },
];

const container = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };
const item = { hidden: { opacity: 0 }, show: { opacity: 1 } };

export function Home() {
  return (
    <PageContainer className="space-y-10 pb-10">
      <section className="relative isolate rounded-3xl bg-gradient-hero p-8 text-white shadow-card md:p-12">
        <div className="pointer-events-none absolute -right-20 -top-20 -z-10 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-16 left-10 -z-10 h-48 w-48 rounded-full bg-blue-400/20 blur-3xl" />
        <div className="relative grid gap-8 md:grid-cols-2 md:items-start">
          <div className="space-y-5">
            <Badge className="gap-1.5 border-white/30 bg-white/15 text-white">
              <Shield className="h-3 w-3 shrink-0" />
              Démo pédagogique — informations à confirmer auprès de l'ENSET
            </Badge>
            <div className="mb-2 w-full max-w-[260px]">
              <BrandLogo variant="full" to={null} />
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-white md:text-4xl lg:text-5xl">
              {BRAND_NAME} — recherche d'informations académiques assistée par IA
            </h1>
            <p className="max-w-lg text-base text-white/85 md:text-lg">
              Assistant intelligent pour l'ENSET Mohammedia (UH2C) — filières, inscriptions,
              bourses et vie étudiante : agents, citations et réponses en streaming.
            </p>
            <div className="flex flex-wrap gap-3 pt-1">
              <Link to="/chat">
                <Button size="lg" className="gap-2 border-0 bg-white text-slate-900 hover:bg-white/95">
                  <span className="text-gradient-cta font-semibold">Commencer le chat</span>
                  <ArrowRight className="h-4 w-4 text-violet-600" />
                </Button>
              </Link>
              <Link to="/documents">
                <Button
                  size="lg"
                  variant="outline"
                  className="gap-2 border-white/40 bg-white/10 text-white hover:bg-white/20 hover:text-white"
                >
                  Corpus <FileText className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
          <Card className="border-white/20 bg-white/95 shadow-card backdrop-blur dark:border-white/10 dark:bg-slate-900/90">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-slate-900 dark:text-white">
                <Sparkles className="h-5 w-5 shrink-0 text-violet-600 dark:text-violet-300" />
                Actions rapides
              </CardTitle>
              <CardDescription className="text-slate-600 dark:text-slate-400">
                Accédez aux modules principaux
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-2">
              {quickActions.map((a) => (
                <Link
                  key={a.to}
                  to={a.to}
                  className="flex items-center gap-3 rounded-xl bg-slate-50 px-4 py-3 text-sm font-medium text-slate-800 transition hover:bg-violet-50 dark:bg-white/5 dark:text-slate-100 dark:hover:bg-white/10"
                >
                  <a.icon className="h-4 w-4 shrink-0 text-violet-600 dark:text-violet-300" />
                  <span className="flex-1">{a.label}</span>
                  <ArrowRight className="h-4 w-4 shrink-0 text-slate-400" />
                </Link>
              ))}
            </CardContent>
          </Card>
        </div>
      </section>

      <section>
        <h2 className="mb-6 text-xl font-semibold text-slate-900 dark:text-slate-50">Fonctionnalités</h2>
        <motion.div variants={container} initial="hidden" animate="show" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <motion.div key={f.title} variants={item}>
              <Card className="h-full">
                <CardContent className="p-6">
                  <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-violet-50 text-violet-700 dark:bg-violet-950/50 dark:text-violet-300">
                    <f.icon className="h-5 w-5" />
                  </div>
                  <h3 className="font-semibold text-slate-900 dark:text-slate-50">{f.title}</h3>
                  <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">{f.desc}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </section>
    </PageContainer>
  );
}
