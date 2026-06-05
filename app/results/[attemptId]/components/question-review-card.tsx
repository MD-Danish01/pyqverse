"use client";

import type { QuestionReviewItem, QuestionStatus } from "./types";
import { SolutionSection } from "./solution-section";
import Image from "next/image";

type QuestionReviewCardProps = {
  item: QuestionReviewItem;
};

const isValidImageUrl = (src: string | null | undefined): src is string => {
  if (!src || typeof src !== "string") return false;
  // Trim and check for empty strings
  const trimmed = src.trim();
  if (trimmed === "" || src === "NULL") return false;
  // Reject URLs that don't match after trimming (i.e., have leading/trailing whitespace)
  if (trimmed !== src) return false;
  // Only accept URLs that start with protocol or are relative paths
  return trimmed.startsWith("http://") || trimmed.startsWith("https://") || trimmed.startsWith("/");
};

const statusConfig: Record<
  QuestionStatus,
  { label: string; badge: string; text: string }
> = {
  correct: {
    label: "Correct",
    badge: "bg-emerald-100 text-emerald-700",
    text: "text-emerald-700",
  },
  wrong: {
    label: "Wrong",
    badge: "bg-rose-100 text-rose-700",
    text: "text-rose-700",
  },
  unattempted: {
    label: "Unattempted",
    badge: "bg-slate-100 text-slate-700",
    text: "text-slate-700",
  },
};

export const QuestionReviewCard = ({ item }: QuestionReviewCardProps) => {
  const statusStyle = statusConfig[item.status];
  const hasStudentAnswer = Boolean(
    item.studentAnswerLabel || item.studentAnswerText,
  );
  const studentAnswerText = hasStudentAnswer
    ? `${item.studentAnswerLabel ?? "Answer"}${
        item.studentAnswerText ? ` - ${item.studentAnswerText}` : ""
      }`
    : "Unattempted";
  const hasCorrectAnswer = Boolean(
    item.correctAnswerLabel || item.correctAnswerText,
  );
  const correctAnswerText = hasCorrectAnswer
    ? `${item.correctAnswerLabel ?? "Answer"}${
        item.correctAnswerText ? ` - ${item.correctAnswerText}` : ""
      }`
    : "Not available";

  return (
    <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
            Question {item.order}
          </p>
          <h3 className="mt-2 text-lg font-semibold text-slate-900">
            {item.subject}
          </h3>
        </div>
        <span
          className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] ${
            statusStyle.badge
          }`}
          aria-label={`Status: ${statusStyle.label}`}
        >
          {statusStyle.label}
        </span>
      </header>

      <div className="mt-4 space-y-4">
        {item.questionText ? (
          <p className="text-base leading-relaxed text-slate-800">
            {item.questionText}
          </p>
        ) : null}
        {isValidImageUrl(item.questionImageUrl) ? (
          <Image
            src={item.questionImageUrl.trim()}
            alt={`Question ${item.order}`}
            className="h-auto w-auto object-contain"
            width={800}
            height={600}
            loading="lazy"
          />
        ) : null}
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-[1.4fr_1.4fr_1fr]">
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
            Your Answer
          </p>
          <p className="mt-2 text-sm font-semibold text-slate-800">
            {studentAnswerText}
          </p>
          {item.isMarkedForReview ? (
            <p className="mt-2 text-xs font-semibold uppercase tracking-[0.15em] text-amber-700">
              Marked for review
            </p>
          ) : null}
        </div>
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
            Correct Answer
          </p>
          <p className="mt-2 text-sm font-semibold text-slate-800">
            {correctAnswerText}
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
            Marks Awarded
          </p>
          <p className={`mt-2 text-2xl font-semibold ${statusStyle.text}`}>
            {item.marksAwarded}
          </p>
        </div>
      </div>

      <SolutionSection
        solutionText={item.solutionText}
        solutionImageUrl={item.solutionImageUrl}
      />
    </article>
  );
};
