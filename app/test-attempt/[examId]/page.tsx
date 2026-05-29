"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { TestSession, type TestSessionSubmitPayload } from "@/components/test-session";
import type {
  AttemptAnswer,
  Question,
  QuestionOptionLabel,
} from "@/components/types";

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
): QuestionOptionLabel => {
  if (value === "A" || value === "B" || value === "C" || value === "D") {
    return value;
  }
  return String.fromCharCode(65 + index) as QuestionOptionLabel;
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
  };
};

const AttemptTest = () => {
  const params = useParams();
  const router = useRouter();
  const examId = params.examId;
  const [questions, setQuestions] = useState<Question[]>([]);
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

  const handleSubmitTest = async ({ answers }: TestSessionSubmitPayload) => {
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
      const studentResponses = Object.values(answers).map((answer) => ({
        questionId: answer.questionId,
        selectedOptionId: answer.selectedOptionId ?? null,
        numericalAnswer: answer.numericalAnswer?.trim() || null,
        isMarkedForReview: answer.isMarkedForReview,
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

  if (questions.length === 0) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-10 text-center text-sm text-gray-600">
        No questions available for this exam.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {submitError ? (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
          <p className="text-sm text-red-700">{submitError}</p>
          <button
            onClick={() => setSubmitError(null)}
            className="mt-4 rounded-lg border border-red-300 px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-100"
          >
            Continue Test
          </button>
        </div>
      ) : null}

      <TestSession
        questions={questions}
        onSubmit={handleSubmitTest}
        isSubmitting={isSubmitting}
      />
    </div>
  );
};

export default AttemptTest;

export const demoQuestions: Question[] = [
  {
    id: 501,
    questionNumber: 1,
    subject: "Mathematics",
    difficulty: "easy",
    questionText: "If x = 3, find the value of 2x + 5.",
    questionImageUrl: null,
    questionType: "single_correct",
    options: [
      { id: 5001, label: "A", optionText: "9" },
      { id: 5002, label: "B", optionText: "11" },
      { id: 5003, label: "C", optionText: "12" },
      { id: 5004, label: "D", optionText: "13" },
    ],
  },
  {
    id: 502,
    questionNumber: 2,
    subject: "Physics",
    difficulty: "medium",
    questionText: "A body is moving with constant velocity. What is its acceleration?",
    questionImageUrl: null,
    questionType: "single_correct",
    options: [
      { id: 5011, label: "A", optionText: "Zero" },
      { id: 5012, label: "B", optionText: "Constant" },
      { id: 5013, label: "C", optionText: "Increasing" },
      { id: 5014, label: "D", optionText: "Decreasing" },
    ],
  },
  {
    id: 503,
    questionNumber: 3,
    subject: "Chemistry",
    difficulty: "medium",
    questionText: "The pH of a neutral solution at 25 C is:",
    questionImageUrl: null,
    questionType: "single_correct",
    options: [
      { id: 5021, label: "A", optionText: "7" },
      { id: 5022, label: "B", optionText: "5" },
      { id: 5023, label: "C", optionText: "9" },
      { id: 5024, label: "D", optionText: "14" },
    ],
  },
  {
    id: 504,
    questionNumber: 4,
    subject: "Mathematics",
    difficulty: "hard",
    questionText: "Find the value of integral from 0 to 1 of 2x dx.",
    questionImageUrl: null,
    questionType: "numerical",
  },
  {
    id: 505,
    questionNumber: 5,
    subject: "Physics",
    difficulty: "easy",
    questionText: "The SI unit of force is:",
    questionImageUrl: null,
    questionType: "single_correct",
    options: [
      { id: 5031, label: "A", optionText: "Joule" },
      { id: 5032, label: "B", optionText: "Watt" },
      { id: 5033, label: "C", optionText: "Newton" },
      { id: 5034, label: "D", optionText: "Pascal" },
    ],
  },
  {
    id: 506,
    questionNumber: 6,
    subject: "Chemistry",
    difficulty: "medium",
    questionText: "Avogadro's number is approximately:",
    questionImageUrl: null,
    questionType: "numerical",
  },
];

export const demoAnswerState: Record<number, AttemptAnswer> = {
  501: {
    questionId: 501,
    selectedOptionId: 5002,
    numericalAnswer: "",
    isMarkedForReview: false,
    visited: true,
    answered: true,
  },
  502: {
    questionId: 502,
    selectedOptionId: null,
    numericalAnswer: "",
    isMarkedForReview: false,
    visited: true,
    answered: false,
  },
  503: {
    questionId: 503,
    selectedOptionId: 5021,
    numericalAnswer: "",
    isMarkedForReview: true,
    visited: true,
    answered: true,
  },
  504: {
    questionId: 504,
    selectedOptionId: null,
    numericalAnswer: "",
    isMarkedForReview: true,
    visited: true,
    answered: false,
  },
  505: {
    questionId: 505,
    selectedOptionId: null,
    numericalAnswer: "",
    isMarkedForReview: false,
    visited: false,
    answered: false,
  },
  506: {
    questionId: 506,
    selectedOptionId: null,
    numericalAnswer: "6.02e23",
    isMarkedForReview: false,
    visited: true,
    answered: true,
  },
};
