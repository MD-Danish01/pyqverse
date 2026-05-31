"use client";

import { useMemo, type ReactNode } from "react";
import type { AttemptAnswer, Question } from "./types";
import { PaletteGrid } from "./palette-grid";
import { PaletteLegend } from "./palette-legend";
import { buildStatusCounts } from "./utils/question-palette";

type QuestionPaletteProps = {
  questions: Question[];
  answers: Record<number, AttemptAnswer>;
  currentQuestionId?: number | null;
  onNavigate: (questionId: number) => void;
  header?: ReactNode;
  className?: string;
};

export const QuestionPalette = ({
  questions,
  answers,
  currentQuestionId,
  onNavigate,
  header,
  className,
}: QuestionPaletteProps) => {
  const counts = useMemo(
    () => buildStatusCounts(questions, answers),
    [questions, answers],
  );

  return (
    <aside
      className={`flex h-full min-h-0 flex-col space-y-2 rounded-sm border border-gray-200 bg-white text-white ${
        className ?? ""
      }`}
    >
      {header ? <div className="px-4 pt-4">{header}</div> : null}
      <div className="px-4 py-3">
        <PaletteLegend counts={counts} />
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-4 pt-5">
        <PaletteGrid
          questions={questions}
          answers={answers}
          currentQuestionId={currentQuestionId}
          onNavigate={onNavigate}
        />
      </div>
    </aside>
  );
};
