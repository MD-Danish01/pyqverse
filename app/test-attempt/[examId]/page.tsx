"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  Question,
  QuestionOption,
  QuestionRenderer,
} from "@/components/question-renderer";

type AttemptQuestionPayload = {
  order: number;
  question: {
    id: number;
    questionText: string | null;
    questionImageUrl: string | null;
    questionType: "single_correct" | "numerical";
    difficulty: "easy" | "medium" | "hard" | null;
    subjectName: string | null;
  };
  options: Array<{
    id: number;
    label: string;
    optionText: string | null;
    optionImageUrl: string | null;
  }>;
};

type AttemptResponse = {
  questions?: AttemptQuestionPayload[];
};

const normalizeSubject = (value: string | null): string => {
  return value ?? "Unknown"; // Pass through directly, no hardcoded defaults
};

const normalizeLabel = (
  value: string | null,
  index: number,
): QuestionOption["label"] => {
  if (value === "A" || value === "B" || value === "C" || value === "D") {
    return value;
  }
  return String.fromCharCode(65 + index) as QuestionOption["label"];
};

const normalizeQuestion = (raw: AttemptQuestionPayload): Question => {
  return {
    id: raw.question.id,
    questionNumber: raw.order,
    subject: normalizeSubject(raw.question.subjectName),
    difficulty: raw.question.difficulty ?? undefined,
    questionText: raw.question.questionText ?? null,
    questionImageUrl: raw.question.questionImageUrl ?? null,
    questionType: raw.question.questionType,
    options: raw.options.map((option, index) => ({
      id: option.id,
      label: normalizeLabel(option.label, index),
      optionText: option.optionText ?? null,
      optionImageUrl: option.optionImageUrl ?? null,
    })),
    selectedOptionId: null,
    numericalAnswer: "",
    isMarkedForReview: false,
  };
};

const AttemptTest = () => {
  const params = useParams();
  const router = useRouter();
  const examId = params.examId;
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    const userId: number | null = JSON.parse(
      localStorage.getItem("userId") ?? "null",
    );

    const fetchQuestions = async () => {
      try {
        setIsLoading(true);
        setErrorMessage(null);
        const res = await fetch("/api/attempt", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ examId, userId }),
        });

        if (!res.ok) {
          throw new Error("Failed to fetch exam questions.");
        }

        const data = (await res.json()) as AttemptResponse;
        const normalized = (data.questions ?? []).map(normalizeQuestion);
        setQuestions(normalized);
        setCurrentIndex(0);
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Unable to load questions.";
        setErrorMessage(message);
      } finally {
        setIsLoading(false);
      }
    };

    if (examId) {
      fetchQuestions();
    }
  }, [examId]);

  const currentQuestion = useMemo(
    () => questions[currentIndex],
    [questions, currentIndex],
  );

  const updateQuestion = (updated: Question) => {
    setQuestions((prev) =>
      prev.map((question, index) =>
        index === currentIndex ? updated : question,
      ),
    );
  };

  const handleSubmitTest = async () => {
    const userId: number | null = JSON.parse(
      localStorage.getItem("userId") ?? "null",
    );

    if (!userId) {
      setSubmitError("User ID not found. Please log in again.");
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      // Collect responses from all questions
      const studentResponses = questions.map((question) => ({
        questionId: question.id,
        selectedOptionId: question.selectedOptionId ?? null,
        numericalAnswer: question.numericalAnswer ?? null,
        isMarkedForReview: question.isMarkedForReview,
      }));

      const payload = {
        examId: Number(examId),
        userId,
        studentResponses,
        submittedAt: new Date().toISOString(),
      };

      const res = await fetch("/api/submit-attempt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to submit test");
      }

      const result = await res.json();
      console.log("Test submitted successfully:", result);

      // Redirect to results page
      router.push(`/results/${result.attemptId}`);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to submit test. Please try again.";
      setSubmitError(message);
      console.error("Error submitting test:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-10 text-center text-sm text-gray-600">
        Loading questions...
      </div>
    );
  }

  if (errorMessage) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-10 text-center text-sm text-red-600">
        {errorMessage}
      </div>
    );
  }

  if (!currentQuestion) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-10 text-center text-sm text-gray-600">
        No questions available for this exam.
      </div>
    );
  }

  if (submitError) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-10 text-center">
        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
          <p className="text-sm text-red-700">{submitError}</p>
          <button
            onClick={() => setSubmitError(null)}
            className="mt-4 rounded-lg border border-red-300 px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-100"
          >
            Continue Test
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <QuestionRenderer
        question={currentQuestion}
        onSelectOption={(optionId) =>
          updateQuestion({ ...currentQuestion, selectedOptionId: optionId })
        }
        onNumericalChange={(value) =>
          updateQuestion({ ...currentQuestion, numericalAnswer: value })
        }
        onClearResponse={() =>
          updateQuestion({
            ...currentQuestion,
            selectedOptionId: null,
            numericalAnswer: "",
          })
        }
        onToggleMarkForReview={() =>
          updateQuestion({
            ...currentQuestion,
            isMarkedForReview: !currentQuestion.isMarkedForReview,
          })
        }
        onNext={() =>
          setCurrentIndex((index) => Math.min(index + 1, questions.length - 1))
        }
        onPrevious={() => setCurrentIndex((index) => Math.max(index - 1, 0))}
        disablePrevious={currentIndex === 0}
        disableNext={currentIndex === questions.length - 1}
      />

      <div className="mt-6 flex justify-end space-x-4">
        <button
          onClick={handleSubmitTest}
          disabled={isSubmitting}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {isSubmitting ? "Submitting..." : "Submit Test"}
        </button>
      </div>
    </>
  );
};

export default AttemptTest;
