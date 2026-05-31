"use client";

import { useCallback, useMemo, useState } from "react";
import type { AttemptAnswer, Question, QuestionStatus } from "./types";
import { QuestionRenderer } from "./question-renderer";
import { QuestionPalette } from "./question-palette";
import { TestActions } from "./test-actions";
import { ExamHeader } from "./exam-header";
import {
  buildAnswerMap,
  createEmptyAnswer,
  normalizeAnswer,
} from "./utils/test-session";
import { getQuestionStatus } from "./utils/question-palette";

export type TestSessionSubmitPayload = {
  answers: Record<number, AttemptAnswer>;
  questionStatuses: Record<number, QuestionStatus>;
};

type TestSessionProps = {
  questions: Question[];
  initialAnswers?: Record<number, AttemptAnswer>;
  onSubmit?: (payload: TestSessionSubmitPayload) => void | Promise<void>;
  isSubmitting?: boolean;
  submitLabel?: string;
  examName: string;
  examType: string;
  remainingSeconds: number;
};

export const TestSession = ({
  questions,
  initialAnswers,
  onSubmit,
  isSubmitting,
  submitLabel = "Submit Test",
  examName,
  examType,
  remainingSeconds,
}: TestSessionProps) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, AttemptAnswer>>(() => {
    const map = buildAnswerMap(questions, initialAnswers);
    const firstQuestion = questions[0];
    if (!firstQuestion) {
      return map;
    }
    const existing =
      map[firstQuestion.id] ?? createEmptyAnswer(firstQuestion.id);
    return {
      ...map,
      [firstQuestion.id]: normalizeAnswer({ ...existing, visited: true }),
    };
  });

  const currentQuestion = questions[currentQuestionIndex];

  const currentAnswer = useMemo(() => {
    if (!currentQuestion) {
      return undefined;
    }
    return answers[currentQuestion.id] ?? createEmptyAnswer(currentQuestion.id);
  }, [answers, currentQuestion]);

  const updateAnswer = useCallback(
    (questionId: number, updater: (answer: AttemptAnswer) => AttemptAnswer) => {
      setAnswers((prev) => {
        const base = prev[questionId] ?? createEmptyAnswer(questionId);
        const updated = normalizeAnswer(updater(base));
        return { ...prev, [questionId]: updated };
      });
    },
    [],
  );

  const questionStatuses = useMemo(() => {
    const statusMap: Record<number, QuestionStatus> = {};
    for (const question of questions) {
      statusMap[question.id] = getQuestionStatus(answers[question.id]);
    }
    return statusMap;
  }, [answers, questions]);

  const currentStatus = currentQuestion
    ? questionStatuses[currentQuestion.id]
    : "not_visited";

  const commitCurrentAnswer = useCallback(() => {
    if (!currentQuestion) {
      return;
    }

    updateAnswer(currentQuestion.id, (answer) => ({
      ...answer,
      visited: true,
    }));
  }, [currentQuestion, updateAnswer]);

  const handleSelectOption = (optionId: number) => {
    if (!currentQuestion) {
      return;
    }

    updateAnswer(currentQuestion.id, (answer) => ({
      ...answer,
      selectedOptionId: optionId,
      numericalAnswer: "",
      visited: true,
    }));
  };

  const handleNumericalChange = (value: string) => {
    if (!currentQuestion) {
      return;
    }

    updateAnswer(currentQuestion.id, (answer) => ({
      ...answer,
      selectedOptionId: null,
      numericalAnswer: value,
      visited: true,
    }));
  };

  const handleClearResponse = () => {
    if (!currentQuestion) {
      return;
    }

    updateAnswer(currentQuestion.id, (answer) => ({
      ...answer,
      selectedOptionId: null,
      numericalAnswer: "",
      visited: true,
    }));
  };

  const goToIndex = (index: number) => {
    if (questions.length === 0) {
      return;
    }
    const safeIndex = Math.min(Math.max(index, 0), questions.length - 1);
    const targetQuestion = questions[safeIndex];
    if (targetQuestion) {
      setAnswers((prev) => {
        const existing =
          prev[targetQuestion.id] ?? createEmptyAnswer(targetQuestion.id);
        if (existing.visited) {
          return prev;
        }
        return {
          ...prev,
          [targetQuestion.id]: normalizeAnswer({ ...existing, visited: true }),
        };
      });
    }
    setCurrentQuestionIndex(safeIndex);
  };

  const handleNext = () => {
    commitCurrentAnswer();
    goToIndex(currentQuestionIndex + 1);
  };

  const handlePrevious = () => {
    commitCurrentAnswer();
    goToIndex(currentQuestionIndex - 1);
  };

  const handleSaveNext = () => {
    commitCurrentAnswer();
    goToIndex(currentQuestionIndex + 1);
  };

  const handleSaveMarkForReview = () => {
    if (!currentQuestion) {
      return;
    }

    updateAnswer(currentQuestion.id, (answer) => ({
      ...answer,
      isMarkedForReview: true,
      visited: true,
    }));
    goToIndex(currentQuestionIndex + 1);
  };

  const handleNavigateToQuestion = (questionId: number) => {
    const targetIndex = questions.findIndex(
      (question) => question.id === questionId,
    );
    if (targetIndex === -1) {
      return;
    }
    commitCurrentAnswer();
    goToIndex(targetIndex);
  };

  const handleSubmit = () => {
    if (!onSubmit) {
      return;
    }

    if (!currentQuestion || !currentAnswer) {
      onSubmit({ answers, questionStatuses });
      return;
    }

    const updatedCurrent = normalizeAnswer({
      ...currentAnswer,
      visited: true,
    });

    const updatedAnswers = {
      ...answers,
      [currentQuestion.id]: updatedCurrent,
    };

    const updatedStatuses: Record<number, QuestionStatus> = {};
    for (const question of questions) {
      updatedStatuses[question.id] = getQuestionStatus(
        updatedAnswers[question.id],
      );
    }

    onSubmit({ answers: updatedAnswers, questionStatuses: updatedStatuses });
  };

  if (!currentQuestion || !currentAnswer) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-10 text-center text-sm text-gray-600">
        No questions available for this exam.
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex h-full min-h-0 flex-col lg:flex-row">
        <div className="flex min-h-0 flex-1 flex-col">
          <div className="min-h-0 flex-1 overflow-y-auto">
            <QuestionRenderer
              question={currentQuestion}
              answer={currentAnswer}
              status={currentStatus}
              onSelectOption={handleSelectOption}
              onNumericalChange={handleNumericalChange}
            />
          </div>

          <div className="shrink-0">
            <TestActions
              onPrevious={handlePrevious}
              onNext={handleNext}
              onSaveNext={handleSaveNext}
              onClearResponse={handleClearResponse}
              onSaveMarkForReview={handleSaveMarkForReview}
              disablePrevious={currentQuestionIndex === 0}
              disableNext={currentQuestionIndex === questions.length - 1}
              onSubmit={onSubmit ? handleSubmit : undefined}
              isSubmitting={isSubmitting}
              submitLabel={submitLabel}
            />
          </div>
        </div>

        <div className="min-h-0 w-full shrink-0 lg:w-95">
          <div className="h-full lg:sticky lg:top-0">
            <QuestionPalette
              className="h-full min-h-0"
              header={
                <ExamHeader
                  examName={examName}
                  examType={examType}
                  remainingSeconds={remainingSeconds}
                />
              }
              questions={questions}
              answers={answers}
              currentQuestionId={currentQuestion.id}
              onNavigate={handleNavigateToQuestion}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
