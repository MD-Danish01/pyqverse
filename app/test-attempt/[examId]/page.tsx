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

  const sessionKey = questions.map((question) => question.id).join("-") || "empty";

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
        key={sessionKey}
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
      { id: 5101, label: "A", optionText: "9" },
      { id: 5102, label: "B", optionText: "11" },
      { id: 5103, label: "C", optionText: "12" },
      { id: 5104, label: "D", optionText: "13" },
    ],
  },
  {
    id: 502,
    questionNumber: 2,
    subject: "Physics",
    difficulty: "medium",
    questionText: "A body moves with constant velocity. Its acceleration is:",
    questionImageUrl: null,
    questionType: "single_correct",
    options: [
      { id: 5201, label: "A", optionText: "Zero" },
      { id: 5202, label: "B", optionText: "Constant" },
      { id: 5203, label: "C", optionText: "Increasing" },
      { id: 5204, label: "D", optionText: "Decreasing" },
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
      { id: 5301, label: "A", optionText: "7" },
      { id: 5302, label: "B", optionText: "5" },
      { id: 5303, label: "C", optionText: "9" },
      { id: 5304, label: "D", optionText: "14" },
    ],
  },
  {
    id: 504,
    questionNumber: 4,
    subject: "Mathematics",
    difficulty: "hard",
    questionText: "Find the value of the integral of 2x from 0 to 1.",
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
      { id: 5501, label: "A", optionText: "Joule" },
      { id: 5502, label: "B", optionText: "Watt" },
      { id: 5503, label: "C", optionText: "Newton" },
      { id: 5504, label: "D", optionText: "Pascal" },
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
  {
    id: 507,
    questionNumber: 7,
    subject: "Mathematics",
    difficulty: "medium",
    questionText: "The value of sin 30 degrees is:",
    questionImageUrl: null,
    questionType: "single_correct",
    options: [
      { id: 5701, label: "A", optionText: "1/2" },
      { id: 5702, label: "B", optionText: "1" },
      { id: 5703, label: "C", optionText: "0" },
      { id: 5704, label: "D", optionText: "sqrt(3)/2" },
    ],
  },
  {
    id: 508,
    questionNumber: 8,
    subject: "Physics",
    difficulty: "easy",
    questionText: "If v = u + at, find a when v = 10, u = 2, t = 4.",
    questionImageUrl: null,
    questionType: "numerical",
  },
  {
    id: 509,
    questionNumber: 9,
    subject: "Chemistry",
    difficulty: "medium",
    questionText: "Which gas is released when zinc reacts with HCl?",
    questionImageUrl: null,
    questionType: "single_correct",
    options: [
      { id: 5901, label: "A", optionText: "O2" },
      { id: 5902, label: "B", optionText: "H2" },
      { id: 5903, label: "C", optionText: "CO2" },
      { id: 5904, label: "D", optionText: "N2" },
    ],
  },
  {
    id: 510,
    questionNumber: 10,
    subject: "Mathematics",
    difficulty: "medium",
    questionText: "Solve for x: 2x + 3 = 11.",
    questionImageUrl: null,
    questionType: "single_correct",
    options: [
      { id: 6001, label: "A", optionText: "2" },
      { id: 6002, label: "B", optionText: "4" },
      { id: 6003, label: "C", optionText: "5" },
      { id: 6004, label: "D", optionText: "6" },
    ],
  },
  {
    id: 511,
    questionNumber: 11,
    subject: "Physics",
    difficulty: "hard",
    questionText: "The dimensional formula of energy is:",
    questionImageUrl: null,
    questionType: "single_correct",
    options: [
      { id: 6101, label: "A", optionText: "ML2T-2" },
      { id: 6102, label: "B", optionText: "MLT-1" },
      { id: 6103, label: "C", optionText: "M2L2T-2" },
      { id: 6104, label: "D", optionText: "ML-1T-2" },
    ],
  },
  {
    id: 512,
    questionNumber: 12,
    subject: "Chemistry",
    difficulty: "easy",
    questionText: "Find the molarity of a 1 mol solution in 1 L.",
    questionImageUrl: null,
    questionType: "numerical",
  },
  {
    id: 513,
    questionNumber: 13,
    subject: "Mathematics",
    difficulty: "medium",
    questionText: "If f(x) = x^2, then f(3) equals:",
    questionImageUrl: null,
    questionType: "single_correct",
    options: [
      { id: 6301, label: "A", optionText: "6" },
      { id: 6302, label: "B", optionText: "9" },
      { id: 6303, label: "C", optionText: "12" },
      { id: 6304, label: "D", optionText: "15" },
    ],
  },
  {
    id: 514,
    questionNumber: 14,
    subject: "Physics",
    difficulty: "medium",
    questionText: "A projectile is launched at 45 degrees. Its range is:",
    questionImageUrl: null,
    questionType: "single_correct",
    options: [
      { id: 6401, label: "A", optionText: "u^2/g" },
      { id: 6402, label: "B", optionText: "u^2/2g" },
      { id: 6403, label: "C", optionText: "2u^2/g" },
      { id: 6404, label: "D", optionText: "u^2/4g" },
    ],
  },
  {
    id: 515,
    questionNumber: 15,
    subject: "Chemistry",
    difficulty: "medium",
    questionText: "The atomic number of oxygen is:",
    questionImageUrl: null,
    questionType: "single_correct",
    options: [
      { id: 6501, label: "A", optionText: "6" },
      { id: 6502, label: "B", optionText: "8" },
      { id: 6503, label: "C", optionText: "10" },
      { id: 6504, label: "D", optionText: "12" },
    ],
  },
  {
    id: 516,
    questionNumber: 16,
    subject: "Mathematics",
    difficulty: "hard",
    questionText: "Evaluate: 1 + 2 + 3 + ... + 10.",
    questionImageUrl: null,
    questionType: "numerical",
  },
  {
    id: 517,
    questionNumber: 17,
    subject: "Physics",
    difficulty: "easy",
    questionText: "The SI unit of power is:",
    questionImageUrl: null,
    questionType: "single_correct",
    options: [
      { id: 6701, label: "A", optionText: "Watt" },
      { id: 6702, label: "B", optionText: "Joule" },
      { id: 6703, label: "C", optionText: "Newton" },
      { id: 6704, label: "D", optionText: "Pascal" },
    ],
  },
  {
    id: 518,
    questionNumber: 18,
    subject: "Chemistry",
    difficulty: "medium",
    questionText: "Which element has the symbol Na?",
    questionImageUrl: null,
    questionType: "single_correct",
    options: [
      { id: 6801, label: "A", optionText: "Nitrogen" },
      { id: 6802, label: "B", optionText: "Sodium" },
      { id: 6803, label: "C", optionText: "Neon" },
      { id: 6804, label: "D", optionText: "Nickel" },
    ],
  },
  {
    id: 519,
    questionNumber: 19,
    subject: "Mathematics",
    difficulty: "medium",
    questionText: "If a = 2, b = 5, compute a^2 + b.",
    questionImageUrl: null,
    questionType: "single_correct",
    options: [
      { id: 6901, label: "A", optionText: "7" },
      { id: 6902, label: "B", optionText: "8" },
      { id: 6903, label: "C", optionText: "9" },
      { id: 6904, label: "D", optionText: "10" },
    ],
  },
  {
    id: 520,
    questionNumber: 20,
    subject: "Physics",
    difficulty: "hard",
    questionText: "The value of g used in JEE Main is approximately:",
    questionImageUrl: null,
    questionType: "numerical",
  },
];

export const demoAnswerState: Record<number, AttemptAnswer> = {
  501: {
    questionId: 501,
    selectedOptionId: 5102,
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
    selectedOptionId: 5303,
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
  507: {
    questionId: 507,
    selectedOptionId: 5701,
    numericalAnswer: "",
    isMarkedForReview: false,
    visited: true,
    answered: true,
  },
  508: {
    questionId: 508,
    selectedOptionId: null,
    numericalAnswer: "",
    isMarkedForReview: false,
    visited: true,
    answered: false,
  },
  509: {
    questionId: 509,
    selectedOptionId: 5902,
    numericalAnswer: "",
    isMarkedForReview: true,
    visited: true,
    answered: true,
  },
  510: {
    questionId: 510,
    selectedOptionId: null,
    numericalAnswer: "",
    isMarkedForReview: true,
    visited: true,
    answered: false,
  },
  511: {
    questionId: 511,
    selectedOptionId: 6101,
    numericalAnswer: "",
    isMarkedForReview: false,
    visited: true,
    answered: true,
  },
  512: {
    questionId: 512,
    selectedOptionId: null,
    numericalAnswer: "",
    isMarkedForReview: false,
    visited: false,
    answered: false,
  },
  513: {
    questionId: 513,
    selectedOptionId: 6302,
    numericalAnswer: "",
    isMarkedForReview: false,
    visited: true,
    answered: true,
  },
  514: {
    questionId: 514,
    selectedOptionId: null,
    numericalAnswer: "",
    isMarkedForReview: false,
    visited: true,
    answered: false,
  },
  515: {
    questionId: 515,
    selectedOptionId: 6502,
    numericalAnswer: "",
    isMarkedForReview: true,
    visited: true,
    answered: true,
  },
  516: {
    questionId: 516,
    selectedOptionId: null,
    numericalAnswer: "",
    isMarkedForReview: false,
    visited: false,
    answered: false,
  },
  517: {
    questionId: 517,
    selectedOptionId: 6701,
    numericalAnswer: "",
    isMarkedForReview: false,
    visited: true,
    answered: true,
  },
  518: {
    questionId: 518,
    selectedOptionId: null,
    numericalAnswer: "",
    isMarkedForReview: false,
    visited: true,
    answered: false,
  },
  519: {
    questionId: 519,
    selectedOptionId: null,
    numericalAnswer: "",
    isMarkedForReview: true,
    visited: true,
    answered: false,
  },
  520: {
    questionId: 520,
    selectedOptionId: null,
    numericalAnswer: "9.8",
    isMarkedForReview: false,
    visited: true,
    answered: true,
  },
};

export const demoActiveQuestionId = 509;

export const demoPaletteState = {
  questions: demoQuestions,
  answers: demoAnswerState,
  currentQuestionId: demoActiveQuestionId,
};
