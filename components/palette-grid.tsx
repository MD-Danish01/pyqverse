"use client";

import type { AttemptAnswer, Question } from "./types";
import { QuestionStatusBadge } from "./question-status-badge";
import { getQuestionStatus } from "./utils/question-palette";

type PaletteGridProps = {
  questions: Question[];
  answers: Record<number, AttemptAnswer>;
  currentQuestionId?: number | null;
  onNavigate: (questionId: number) => void;
};

export const PaletteGrid = ({
  questions,
  answers,
  currentQuestionId,
  onNavigate,
}: PaletteGridProps) => {
  return (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(48px,1fr))] gap-2">
      {questions.map((question) => {
        const status = getQuestionStatus(answers[question.id]);
        return (
          <QuestionStatusBadge
            key={question.id}
            status={status}
            number={question.questionNumber}
            isCurrent={question.id === currentQuestionId}
            onClick={() => onNavigate(question.id)}
          />
        );
      })}
    </div>
  );
};
