import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, ChevronRight, Loader2, RotateCcw, Sparkles, Trophy, X } from "lucide-react";
import { PageContainer } from "@/components/layout/PageContainer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { generateQuiz, type GeneratedQuizQuestion } from "@/services/api";

type Question = {
  question: string;
  options: string[];
  correctIndex: number;
  explanation?: string | null;
};

type Filiere = {
  id: string;
  label: string;
  description: string;
  accent: string;
};

type Difficulty = "facile" | "moyen" | "difficile";

const FILIERES: Filiere[] = [
  {
    id: "informatique",
    label: "Génie Informatique",
    description: "Algorithmique, logique, mathématiques et culture numérique.",
    accent: "from-violet-500 to-indigo-500",
  },
  {
    id: "electrique",
    label: "Génie Électrique",
    description: "Électricité, électronique et physique appliquée.",
    accent: "from-amber-500 to-orange-500",
  },
  {
    id: "mecanique",
    label: "Génie Mécanique",
    description: "Mécanique, matériaux et physique générale.",
    accent: "from-emerald-500 to-teal-500",
  },
];

const DIFFICULTIES: { id: Difficulty; label: string }[] = [
  { id: "facile", label: "Facile" },
  { id: "moyen", label: "Moyen" },
  { id: "difficile", label: "Difficile" },
];

const QUESTION_COUNT = 5;

export function Quiz() {
  const [filiere, setFiliere] = useState<Filiere | null>(null);
  const [difficulty, setDifficulty] = useState<Difficulty>("moyen");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [selected, setSelected] = useState<number | null>(null);
  const [finished, setFinished] = useState(false);

  const score = useMemo(
    () => answers.reduce((acc, ans, i) => acc + (ans === questions[i]?.correctIndex ? 1 : 0), 0),
    [answers, questions],
  );

  function reset() {
    setFiliere(null);
    setQuestions([]);
    setError(null);
    setCurrent(0);
    setAnswers([]);
    setSelected(null);
    setFinished(false);
  }

  async function startQuiz(f: Filiere) {
    setFiliere(f);
    setLoading(true);
    setError(null);
    setQuestions([]);
    setCurrent(0);
    setAnswers([]);
    setSelected(null);
    setFinished(false);
    try {
      const data = await generateQuiz(f.label, QUESTION_COUNT, difficulty);
      const cleaned: Question[] = (data.questions || [])
        .filter((q: GeneratedQuizQuestion) => q.options && q.options.length >= 2)
        .map((q) => ({
          question: q.question,
          options: q.options,
          correctIndex: q.correctIndex,
          explanation: q.explanation,
        }));
      if (cleaned.length === 0) throw new Error("Aucune question générée.");
      setQuestions(cleaned);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Échec de génération du quiz.");
    } finally {
      setLoading(false);
    }
  }

  function validate() {
    if (selected === null) return;
    const nextAnswers = [...answers, selected];
    setAnswers(nextAnswers);
    setSelected(null);
    if (current + 1 >= questions.length) {
      setFinished(true);
    } else {
      setCurrent((c) => c + 1);
    }
  }

  if (!filiere) {
    return (
      <PageContainer className="space-y-6">
        <div className="space-y-1">
          <h2 className="text-lg font-semibold text-foreground">Quiz de préparation au concours</h2>
          <p className="text-sm text-muted">
            Chaque quiz est généré par l'IA — choisissez la difficulté et votre filière pour démarrer.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-medium uppercase tracking-wide text-muted">Difficulté</span>
          {DIFFICULTIES.map((d) => (
            <button
              key={d.id}
              type="button"
              onClick={() => setDifficulty(d.id)}
              className={
                "rounded-full px-3 py-1 text-xs font-medium transition " +
                (difficulty === d.id
                  ? "bg-gradient-brand text-white shadow-soft"
                  : "bg-surface-muted text-muted hover:text-foreground")
              }
            >
              {d.label}
            </button>
          ))}
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FILIERES.map((f, i) => (
            <motion.button
              key={f.id}
              type="button"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              onClick={() => startQuiz(f)}
              className="group text-left"
            >
              <Card className="h-full transition group-hover:shadow-card group-hover:-translate-y-0.5">
                <CardHeader className="pb-2">
                  <div className={`h-1.5 w-12 rounded-full bg-gradient-to-r ${f.accent}`} />
                  <CardTitle className="pt-3 text-base">{f.label}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm leading-relaxed text-muted">{f.description}</p>
                  <span className="flex items-center gap-1 text-xs font-medium text-violet-brand">
                    <Sparkles className="h-3.5 w-3.5" />
                    Générer un quiz IA
                    <ChevronRight className="h-3.5 w-3.5" />
                  </span>
                </CardContent>
              </Card>
            </motion.button>
          ))}
        </div>
      </PageContainer>
    );
  }

  if (loading) {
    return (
      <PageContainer className="flex min-h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-center">
          <Loader2 className="h-8 w-8 animate-spin text-violet-brand" />
          <p className="text-sm font-medium text-foreground">Génération du quiz par l'IA…</p>
          <p className="text-xs text-muted">Filière {filiere.label} · difficulté {difficulty}</p>
        </div>
      </PageContainer>
    );
  }

  if (error) {
    return (
      <PageContainer className="flex min-h-[60vh] items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="space-y-4 p-6 text-center">
            <p className="text-sm text-danger">{error}</p>
            <div className="flex justify-center gap-2">
              <Button onClick={() => startQuiz(filiere)} className="gap-2">
                <RotateCcw className="h-4 w-4" />
                Réessayer
              </Button>
              <Button variant="ghost" onClick={reset}>
                Retour
              </Button>
            </div>
          </CardContent>
        </Card>
      </PageContainer>
    );
  }

  if (finished) {
    const pct = Math.round((score / questions.length) * 100);
    return (
      <PageContainer className="space-y-6">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
          <Card className="overflow-hidden">
            <div className="bg-gradient-brand px-6 py-8 text-center text-white">
              <Trophy className="mx-auto h-10 w-10" />
              <h2 className="mt-3 text-2xl font-bold">
                {score} / {questions.length}
              </h2>
              <p className="text-sm text-white/85">
                {filiere.label} — {pct}% de bonnes réponses
              </p>
            </div>
            <CardContent className="space-y-3 p-6">
              {questions.map((q, i) => {
                const ok = answers[i] === q.correctIndex;
                return (
                  <div key={i} className="rounded-2xl bg-surface-muted/50 p-4">
                    <div className="flex items-start gap-2">
                      <span
                        className={
                          "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-white " +
                          (ok ? "bg-success" : "bg-danger")
                        }
                      >
                        {ok ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                      </span>
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-foreground">{q.question}</p>
                        {!ok ? (
                          <p className="text-xs text-success">Bonne réponse : {q.options[q.correctIndex]}</p>
                        ) : null}
                        {q.explanation ? <p className="text-xs text-muted">{q.explanation}</p> : null}
                      </div>
                    </div>
                  </div>
                );
              })}
              <div className="flex gap-2">
                <Button className="flex-1 gap-2" onClick={() => startQuiz(filiere)}>
                  <Sparkles className="h-4 w-4" />
                  Nouveau quiz IA
                </Button>
                <Button variant="ghost" onClick={reset}>
                  Changer de filière
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </PageContainer>
    );
  }

  const q = questions[current];
  const progress = Math.round((current / questions.length) * 100);

  return (
    <PageContainer className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Badge variant="outline">{filiere.label}</Badge>
          <p className="mt-1 text-xs text-muted">
            Question {current + 1} sur {questions.length}
          </p>
        </div>
        <Button variant="ghost" size="sm" className="gap-1.5" onClick={reset}>
          <RotateCcw className="h-3.5 w-3.5" />
          Changer de filière
        </Button>
      </div>

      <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-muted">
        <motion.div className="h-full bg-gradient-brand" initial={{ width: 0 }} animate={{ width: `${progress}%` }} />
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={current} initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }}>
          <Card>
            <CardHeader>
              <CardTitle className="text-base leading-relaxed">{q.question}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {q.options.map((opt, idx) => {
                const active = selected === idx;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelected(idx)}
                    className={
                      "flex w-full items-center gap-3 rounded-2xl border px-4 py-3 text-left text-sm transition " +
                      (active
                        ? "border-violet-brand bg-accent-soft text-foreground shadow-soft"
                        : "border-border bg-surface text-foreground hover:border-violet-brand/40 hover:bg-accent-soft/40")
                    }
                  >
                    <span
                      className={
                        "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-xs font-semibold " +
                        (active ? "border-violet-brand bg-violet-brand text-white" : "border-border text-muted")
                      }
                    >
                      {String.fromCharCode(65 + idx)}
                    </span>
                    {opt}
                  </button>
                );
              })}
              <Button className="w-full gap-2" disabled={selected === null} onClick={validate}>
                {current + 1 >= questions.length ? "Terminer le quiz" : "Question suivante"}
                <ChevronRight className="h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </AnimatePresence>
    </PageContainer>
  );
}
