"use client";

import { useCallback, useMemo, useRef, useState, useEffect } from "react";
import type { AttemptAnswer, Question, QuestionStatus } from "./types";
import { QuestionRenderer } from "./question-renderer";
import { QuestionPalette } from "./question-palette";
import { TestActions } from "./test-actions";
import { ExamHeader } from "./exam-header";
import { BottomSheet } from "./bottom-sheet";
import {
  buildAnswerMap,
  createEmptyAnswer,
  normalizeAnswer,
} from "./utils/test-session";
import { getQuestionStatus } from "./utils/question-palette";

const formatTime = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
};

export type TestSessionSubmitPayload = {
  answers: Record<number, AttemptAnswer>;
  questionStatuses: Record<number, QuestionStatus>;
};

export type TestSessionStateChangePayload = {
  answers: Record<number, AttemptAnswer>;
  currentQuestionIndex: number;
  isPaletteOpen: boolean;
};

type TestSessionProps = {
  questions: Question[];
  initialAnswers?: Record<number, AttemptAnswer>;
  onSubmit?: (payload: TestSessionSubmitPayload) => void | Promise<void>;
  onStateChange?: (payload: TestSessionStateChangePayload) => void;
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
  onStateChange,
  isSubmitting,
  submitLabel = "Submit Test",
  examName,
  examType,
  remainingSeconds,
}: TestSessionProps) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isPaletteOpen, setIsPaletteOpen] = useState(false);
  const touchStartYRef = useRef<number>(0);
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

  // // Notify parent of state changes for persistence
  // useEffect(() => {
  //   if (onStateChange) {
  //     onStateChange({
  //       answers,
  //       currentQuestionIndex,
  //       isPaletteOpen,
  //     });
  //   }
  // }, [answers, currentQuestionIndex, isPaletteOpen, onStateChange]);

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

  const handleTogglePalette = useCallback(() => {
    setIsPaletteOpen((prev) => !prev);
  }, []);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartYRef.current = e.touches[0].clientY;
  }, []);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    const touchEndY = e.changedTouches[0].clientY;
    const deltaY = touchStartYRef.current - touchEndY;

    // If swiped up > 200px, open palette
    if (deltaY > 200) {
      setIsPaletteOpen(true);
    }
  }, []);

  if (!currentQuestion || !currentAnswer) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-10 text-center text-sm text-gray-600">
        No questions available for this exam.
      </div>
    );
  }

  return (
    <div
      className="flex h-screen flex-col lg:h-full lg:flex-row lg:gap-6"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div className="flex min-h-0 flex-1 flex-col">
        {/* Mobile: Header with Hamburger and Timer - Sticky at Top */}
        <div className="sticky top-0 z-20 border-b border-gray-200 bg-white px-2 py-2 sm:px-4 lg:hidden">
          <div className="flex items-center justify-between">
            {/* Hamburger Icon */}
            <button
              type="button"
              onClick={handleTogglePalette}
              className="p-2 hover:bg-gray-100 rounded transition"
              aria-label="Toggle question palette"
            >
              <svg
                className="h-6 w-6 text-gray-700"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>

            {/* Timer */}
            <div className="text-sm font-semibold text-gray-900">
              {formatTime(remainingSeconds)}
            </div>
          </div>
        </div>

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
            onTogglePalette={handleTogglePalette}
            isPaletteOpen={isPaletteOpen}
            remainingSeconds={remainingSeconds}
          />
        </div>
      </div>

      {/* Desktop: Sidebar Palette */}
      <div className="hidden min-h-0 shrink-0 lg:flex lg:w-95 lg:flex-col">
        <div className="min-h-0 flex-1 lg:sticky lg:top-0">
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

      {/* Mobile: Bottom Sheet Palette */}
      <BottomSheet
        isOpen={isPaletteOpen}
        onClose={() => setIsPaletteOpen(false)}
        title="Questions"
      >
        <div className="px-4 py-4">
          <QuestionPalette
            className="min-h-0"
            questions={questions}
            answers={answers}
            currentQuestionId={currentQuestion.id}
            onNavigate={(questionId) => {
              handleNavigateToQuestion(questionId);
              setIsPaletteOpen(false);
            }}
          />
        </div>
      </BottomSheet>
    </div>
  );
};
