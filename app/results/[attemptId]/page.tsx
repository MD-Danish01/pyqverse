import { notFound } from "next/navigation";
import { Fraunces, IBM_Plex_Sans } from "next/font/google";
import { eq, inArray } from "drizzle-orm";
import db from "@/lib/db";
import {
  attemptAnswers,
  exams,
  questionOptions,
  questions,
  subjects,
  testAttempts,
  testQuestions,
} from "@/db/schema";
import { ResultSummary } from "./components/result-summary";
import { PerformanceOverview } from "./components/performance-overview";
import { SubjectAnalysis } from "./components/subject-analysis";
import { QuestionReviewSection } from "./components/question-review-section";
import type {
  PerformanceSummary,
  QuestionReviewItem,
  StatusCounts,
  SubjectSummary,
} from "./components/types";
import Link from "next/link";

const headingFont = Fraunces({
  subsets: ["latin"],
  weight: ["600", "700"],
});

const bodyFont = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const formatDate = (value: Date | null) => {
  if (!value) {
    return "Not submitted";
  }
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(value);
};

const formatDuration = (seconds: number | null) => {
  if (seconds === null) {
    return "Not available";
  }
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
};

const formatNumber = (value: number) => {
  return new Intl.NumberFormat("en-IN", {
    maximumFractionDigits: 2,
  }).format(value);
};

// type ResultPageProps = {
//   params: { attemptId: string };
// };

interface PageProps {
  params: Promise<{ attemptId: string }>;
}

export default async function ResultPage({ params }: PageProps) {
  const { attemptId } = await params;
  // console.log("Received attemptId:", attemptId);
  const attemptIdNumber = Number(attemptId);

  if (Number.isNaN(attemptIdNumber)) {
    notFound();
  }

  const [attempt] = await db
    .select({
      attemptId: testAttempts.id,
      examName: exams.name,
      submittedAt: testAttempts.submittedAt,
      startedAt: testAttempts.startedAt,
      durationSeconds: testAttempts.durationSeconds,
      score: testAttempts.score,
      totalMarks: testAttempts.totalMarks,
      correctCount: testAttempts.correctCount,
      wrongCount: testAttempts.wrongCount,
      unattemptedCount: testAttempts.unattemptedCount,
      accuracy: testAttempts.accuracy,
    })
    .from(testAttempts)
    .leftJoin(exams, eq(testAttempts.examId, exams.id))
    .where(eq(testAttempts.id, attemptIdNumber));

  if (!attempt || !attempt.examName) {
    notFound();
  }

  const questionRows = await db
    .select({
      testQuestionId: testQuestions.id,
      questionOrder: testQuestions.questionOrder,
      questionId: questions.id,
      questionText: questions.questionText,
      questionImageUrl: questions.questionImageUrl,
      questionType: questions.questionType,
      correctAnswerText: questions.correctAnswerText,
      solutionText: questions.solutionText,
      solutionImageUrl: questions.solutionImageUrl,
      subjectId: subjects.id,
      subjectName: subjects.name,
      selectedOptionId: attemptAnswers.selectedOptionId,
      answerText: attemptAnswers.answerText,
      isCorrect: attemptAnswers.isCorrect,
      isAttempted: attemptAnswers.isAttempted,
      isMarkedForReview: attemptAnswers.isMarkedForReview,
      marksAwarded: attemptAnswers.marksAwarded,
    })
    .from(testQuestions)
    .innerJoin(questions, eq(testQuestions.questionId, questions.id))
    .innerJoin(subjects, eq(testQuestions.subjectId, subjects.id))
    .leftJoin(
      attemptAnswers,
      eq(attemptAnswers.testQuestionId, testQuestions.id),
    )
    .where(eq(testQuestions.attemptId, attemptIdNumber))
    .orderBy(testQuestions.questionOrder);

  const questionIds = questionRows.map((row) => row.questionId);
  const optionRows = questionIds.length
    ? await db
        .select({
          id: questionOptions.id,
          questionId: questionOptions.questionId,
          label: questionOptions.label,
          optionText: questionOptions.optionText,
          optionImageUrl: questionOptions.optionImageUrl,
          isCorrect: questionOptions.isCorrect,
        })
        .from(questionOptions)
        .where(inArray(questionOptions.questionId, questionIds))
    : [];

  const optionsByQuestionId = new Map<number, typeof optionRows>();
  for (const option of optionRows) {
    const existing = optionsByQuestionId.get(option.questionId) ?? [];
    existing.push(option);
    optionsByQuestionId.set(option.questionId, existing);
  }

  const questionItems: QuestionReviewItem[] = questionRows.map((row) => {
    const options = optionsByQuestionId.get(row.questionId) ?? [];
    const selectedOption = options.find(
      (option) => option.id === row.selectedOptionId,
    );
    const correctOption = options.find((option) => option.isCorrect);
    const isAttempted = Boolean(row.isAttempted);
    const isCorrect = Boolean(row.isCorrect);
    const status = isAttempted
      ? isCorrect
        ? "correct"
        : "wrong"
      : "unattempted";

    const studentAnswerLabel = selectedOption
      ? `Option ${selectedOption.label}`
      : row.answerText
        ? "Answer"
        : null;
    const studentAnswerText = selectedOption
      ? (selectedOption.optionText ?? null)
      : (row.answerText ?? null);

    const correctAnswerLabel =
      row.questionType === "single_correct" && correctOption
        ? `Option ${correctOption.label}`
        : row.questionType === "numerical"
          ? "Answer"
          : null;
    const correctAnswerText =
      row.questionType === "single_correct"
        ? (correctOption?.optionText ?? null)
        : (row.correctAnswerText ?? null);

    return {
      id: row.questionId,
      order: row.questionOrder,
      subjectId: row.subjectId,
      subject: row.subjectName,
      status,
      questionText: row.questionText,
      questionImageUrl: row.questionImageUrl,
      questionType: row.questionType,
      studentAnswerLabel,
      studentAnswerText,
      correctAnswerLabel,
      correctAnswerText,
      marksAwarded: Number(row.marksAwarded ?? 0),
      solutionText: row.solutionText,
      solutionImageUrl: row.solutionImageUrl,
      isMarkedForReview: Boolean(row.isMarkedForReview),
    };
  });

  const summaryFromItems = questionItems.reduce(
    (acc, item) => {
      if (item.status === "correct") {
        acc.correct += 1;
      } else if (item.status === "wrong") {
        acc.wrong += 1;
      } else {
        acc.unattempted += 1;
      }
      acc.score += item.marksAwarded;
      return acc;
    },
    { correct: 0, wrong: 0, unattempted: 0, score: 0 },
  );

  const accuracyFromItems =
    summaryFromItems.correct + summaryFromItems.wrong > 0
      ? (summaryFromItems.correct /
          (summaryFromItems.correct + summaryFromItems.wrong)) *
        100
      : 0;

  const performanceSummary: PerformanceSummary = {
    correct: attempt.correctCount ?? summaryFromItems.correct,
    wrong: attempt.wrongCount ?? summaryFromItems.wrong,
    unattempted: attempt.unattemptedCount ?? summaryFromItems.unattempted,
    accuracy: attempt.accuracy ?? accuracyFromItems,
  };

  const statusCounts: StatusCounts = {
    all: questionItems.length,
    correct: summaryFromItems.correct,
    wrong: summaryFromItems.wrong,
    unattempted: summaryFromItems.unattempted,
  };

  const subjectMap = new Map<number, SubjectSummary>();
  for (const item of questionItems) {
    const existing = subjectMap.get(item.subjectId) ?? {
      id: item.subjectId,
      name: item.subject,
      score: 0,
      correct: 0,
      wrong: 0,
    };

    existing.score += item.marksAwarded;
    if (item.status === "correct") {
      existing.correct += 1;
    } else if (item.status === "wrong") {
      existing.wrong += 1;
    }

    subjectMap.set(item.subjectId, existing);
  }

  const subjectSummaries = Array.from(subjectMap.values());
  const weakestSubjectId = subjectSummaries.length
    ? subjectSummaries.reduce((weakest, current) =>
        current.score < weakest.score ? current : weakest,
      ).id
    : undefined;

  const subjectOptions = subjectSummaries.map((subject) => ({
    id: subject.id,
    name: subject.name,
  }));

  const totalMarks = Number(attempt.totalMarks ?? 0);
  const score = Number(attempt.score ?? summaryFromItems.score);
  const scoreLabel = `${formatNumber(score)} / ${formatNumber(totalMarks)}`;

  const submittedLabel = formatDate(attempt.submittedAt ?? null);
  const timeUsedSeconds =
    attempt.submittedAt && attempt.startedAt
      ? Math.max(
          0,
          Math.round(
            (attempt.submittedAt.getTime() - attempt.startedAt.getTime()) /
              1000,
          ),
        )
      : (attempt.durationSeconds ?? null);
  const timeUsedLabel = formatDuration(timeUsedSeconds);

  return (
    <div className={`${bodyFont.className} min-h-screen bg-slate-50`}>
      <div className="relative overflow-hidden bg-[radial-gradient(ellipse_at_top,var(--tw-gradient-stops))] from-amber-50 via-white to-slate-50">
        <div className="pointer-events-none absolute -right-20 top-10 h-64 w-64 rounded-full bg-emerald-100/60 blur-3xl" />
        <div className="pointer-events-none absolute -left-24 bottom-10 h-72 w-72 rounded-full bg-amber-100/70 blur-3xl" />
        <main className="relative mx-auto max-w-6xl px-4 py-12 lg:py-16">
          <div className="flex items-center gap-4 mb-8 text-black">
            <Link href="/">
              <button className="bg-amber-600 hover:bg-amber-700 text-white text-sm font-medium px-4 py-2 rounded transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2">
                Home
              </button>
            </Link>
          </div>
          <ResultSummary
            examName={attempt.examName}
            submittedLabel={submittedLabel}
            timeUsedLabel={timeUsedLabel}
            scoreLabel={scoreLabel}
            headingClassName={headingFont.className}
          />

          <PerformanceOverview
            summary={performanceSummary}
            headingClassName={headingFont.className}
          />

          <SubjectAnalysis
            subjects={subjectSummaries}
            weakestSubjectId={weakestSubjectId}
            headingClassName={headingFont.className}
          />

          <QuestionReviewSection
            items={questionItems}
            subjects={subjectOptions}
            statusCounts={statusCounts}
            headingClassName={headingFont.className}
          />
        </main>
      </div>
    </div>
  );
}
