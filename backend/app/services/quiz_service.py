"""Service de génération de quiz."""

from __future__ import annotations

from app.agents import quiz_agent
from app.llm.local_llm import get_llm
from app.models.schemas import QuizQuestion, QuizRequest, QuizResponse


def _sanitize(raw_questions: list[dict]) -> list[QuizQuestion]:
    questions: list[QuizQuestion] = []
    for item in raw_questions:
        if not isinstance(item, dict):
            continue
        text = str(item.get("question") or "").strip()
        options = [str(o).strip() for o in (item.get("options") or []) if str(o).strip()]
        if not text or len(options) < 2:
            continue
        options = options[:4]
        try:
            correct = int(item.get("correct_index", 0))
        except (TypeError, ValueError):
            correct = 0
        correct = max(0, min(correct, len(options) - 1))
        explanation = item.get("explanation")
        questions.append(
            QuizQuestion(
                question=text,
                options=options,
                correct_index=correct,
                explanation=str(explanation).strip() if explanation else None,
            )
        )
    return questions


async def run_quiz(body: QuizRequest) -> QuizResponse:
    llm = get_llm()
    raw = await quiz_agent.generate_quiz(llm, body.filiere, body.count, body.difficulty)
    questions = _sanitize(raw)
    if not questions:
        raise RuntimeError("Le modèle n'a pas généré de quiz exploitable. Réessayez.")
    return QuizResponse(filiere=body.filiere, questions=questions)
