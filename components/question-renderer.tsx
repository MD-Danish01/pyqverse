"use client";

import React from "react";
import Image from "next/image";
import "katex/dist/katex.min.css";
import { InlineMath, BlockMath } from "react-katex";

export type QuestionOption = {
  id: number;
  label: "A" | "B" | "C" | "D";
  optionText?: string | null;
  optionImageUrl?: string | null;
};

export type Question = {
  id: number;
  questionNumber: number;
  subject: string;
  difficulty?: "easy" | "medium" | "hard";
  questionText?: string | null;
  questionImageUrl?: string | null;
  questionType: "single_correct" | "numerical";
  options?: QuestionOption[];
  selectedOptionId?: number | null;
  numericalAnswer?: string;
  isMarkedForReview?: boolean;
};

export type QuestionRendererProps = {
  question: Question;
  onSelectOption: (optionId: number) => void;
  onNumericalChange: (value: string) => void;
  onClearResponse: () => void;
  onToggleMarkForReview: () => void;
  onNext: () => void;
  onPrevious: () => void;
  disablePrevious?: boolean;
  disableNext?: boolean;
};

const getSubjectBadgeClasses = (subject: string) => {
  const normalized = subject?.toLowerCase().trim() || "";
  
  if (normalized === "mathematics" || normalized === "maths") {
    return "bg-blue-50 text-blue-700 border-blue-200";
  }
  if (normalized === "physics") {
    return "bg-emerald-50 text-emerald-700 border-emerald-200";
  }
  if (normalized === "chemistry") {
    return "bg-amber-50 text-amber-700 border-amber-200";
  }
  // Default for any other subject
  return "bg-gray-50 text-gray-700 border-gray-200";
};

const getDifficultyBadgeClasses = (difficulty?: Question["difficulty"]) => {
  switch (difficulty) {
    case "easy":
      return "bg-green-50 text-green-700 border-green-200";
    case "medium":
      return "bg-yellow-50 text-yellow-700 border-yellow-200";
    case "hard":
      return "bg-red-50 text-red-700 border-red-200";
    default:
      return "bg-gray-50 text-gray-700 border-gray-200";
  }
};

type MathSegment =
  | { type: "text"; value: string }
  | { type: "inline"; value: string }
  | { type: "block"; value: string };

const parseMathSegments = (content: string): MathSegment[] => {
  const pattern = /(\$\$[\s\S]+?\$\$|\\\[[\s\S]+?\\\]|\\\([\s\S]+?\\\))/g;
  const segments: MathSegment[] = [];
  let lastIndex = 0;

  for (const match of content.matchAll(pattern)) {
    const index = match.index ?? 0;
    if (index > lastIndex) {
      segments.push({ type: "text", value: content.slice(lastIndex, index) });
    }

    const raw = match[0];
    if (raw.startsWith("$$") || raw.startsWith("\\[")) {
      const value = raw.replace(/^\$\$|\$\$$/g, "").replace(/^\\\[|\\\]$/g, "");
      segments.push({ type: "block", value });
    } else {
      const value = raw.replace(/^\\\(|\\\)$/g, "");
      segments.push({ type: "inline", value });
    }

    lastIndex = index + raw.length;
  }

  if (lastIndex < content.length) {
    segments.push({ type: "text", value: content.slice(lastIndex) });
  }

  return segments;
};

const renderTextWithLineBreaks = (text: string) => {
  const lines = text.split(/\r?\n/);
  return lines.map((line, index) => (
    <React.Fragment key={`line-${index}`}>
      {line}
      {index < lines.length - 1 ? <br /> : null}
    </React.Fragment>
  ));
};

const looksLikeStandaloneLatex = (content: string) => {
  const trimmed = content.trim();
  if (!trimmed) {
    return false;
  }

  const latexSignals =
    /\\(frac|sqrt|int|sum|prod|lim|theta|pi|alpha|beta|gamma|rho|mu|sigma|log|sin|cos|tan)\b|[_^]/;

  return latexSignals.test(trimmed);
};

const MathContent = ({ content }: { content: string }) => {
  if (!content.trim()) {
    return null;
  }

  const segments = parseMathSegments(content);
  const hasMathDelimiters = segments.some((segment) => segment.type !== "text");
  const shouldRenderAsBlock =
    !hasMathDelimiters && looksLikeStandaloneLatex(content);

  if (shouldRenderAsBlock) {
    return (
      <div className="space-y-3">
        <div className="text-base leading-relaxed text-gray-900">
          <div className="overflow-x-auto">
            <BlockMath
              math={content}
              errorColor="#9CA3AF"
              renderError={() => <span>{content}</span>}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="text-base leading-relaxed text-gray-900">
        {segments.map((segment, index) => {
          if (segment.type === "text") {
            return (
              <span key={`text-${index}`}>
                {renderTextWithLineBreaks(segment.value)}
              </span>
            );
          }

          if (segment.type === "inline") {
            return (
              <span
                key={`inline-${index}`}
                className="inline-block max-w-full overflow-x-auto align-baseline"
              >
                <InlineMath
                  math={segment.value}
                  errorColor="#9CA3AF"
                  renderError={() => <span>{segment.value}</span>}
                />
              </span>
            );
          }

          return (
            <div key={`block-${index}`} className="overflow-x-auto">
              <BlockMath
                math={segment.value}
                errorColor="#9CA3AF"
                renderError={() => <span>{segment.value}</span>}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};

type QuestionImageProps = {
  src: string;
  alt: string;
  maxHeightClass?: string;
  size?: "question" | "option";
  allowScroll?: boolean;
};

const buildCloudinaryUrl = (src: string, width: number) => {
  if (!src.includes("res.cloudinary.com")) {
    return src;
  }
  
  // Use moderate widths that compress large images but don't scale up small ones
  const transform = `f_auto,q_auto,w_${width},c_limit`;
  
  if (src.includes("/image/upload/")) {
    return src.replace("/image/upload/", `/image/upload/${transform}/`);
  }
  
  const uploadIndex = src.indexOf("/upload/");
  if (uploadIndex !== -1) {
    return `${src.slice(0, uploadIndex + 8)}${transform}/${src.slice(uploadIndex + 8)}`;
  }
  
  return src;
};

const QuestionImage = ({
  src,
  alt,
  maxHeightClass = "max-h-[360px] sm:max-h-[420px]",
  size = "question",
  allowScroll = true,
}: QuestionImageProps) => {
  // Use moderate widths: c_limit prevents upscaling small images
  const cloudinaryWidth = size === "option" ? 600 : 1000;
  const imageWidth = size === "option" ? 600 : 1000;
  const imageHeight = size === "option" ? 450 : 750;
  const sizes = size === "option" 
    ? "(max-width: 768px) 90vw, 600px"
    : "(max-width: 768px) 100vw, 1000px";
  
  const optimizedSrc = buildCloudinaryUrl(src, cloudinaryWidth);
  const overflowClass = allowScroll ? "overflow-auto" : "overflow-hidden";

  return (
    <div className={`${overflowClass} border-0 border-gray-200 bg-white ${maxHeightClass}`}>
      <Image
        src={optimizedSrc}
        alt={alt}
        width={imageWidth}
        height={imageHeight}
        sizes={sizes}
        className="h-auto w-auto object-contain"
        priority={size === "question"}
      />
    </div>
  );
};

const OptionCard = ({
  option,
  isSelected,
  onSelect,
  name,
}: {
  option: QuestionOption;
  isSelected: boolean;
  onSelect: () => void;
  name: string;
}) => {
  return (
    <label
      className={`flex cursor-pointer items-start gap-2 border p-1 transition-colors focus-within:ring-1 focus-within:ring-gray-400 ${
        isSelected
          ? "border-gray-600 bg-gray-50"
          : "border-gray-200 hover:border-gray-300 hover:bg-gray-50/60"
      }`}
    >
      <input
        type="radio"
        name={name}
        checked={isSelected}
        onChange={onSelect}
        className="mt-1 h-4 w-4 accent-gray-800"
        aria-label={`Option ${option.label}`}
      />
      <div className="flex-1 space-y-3">
        <div className="flex items-center gap-3">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-300 bg-white text-sm font-semibold text-gray-800">
            {option.label}
          </span>
          <div className="text-base leading-relaxed text-gray-900">
            {option.optionText ? (
              <MathContent content={option.optionText} />
            ) : null}
          </div>
        </div>
        {option.optionImageUrl ? (
          <QuestionImage
            src={option.optionImageUrl}
            alt={`Option ${option.label}`}
            maxHeightClass="max-h-[280px] sm:max-h-[320px]"
            size="option"
            allowScroll
          />
        ) : null}
      </div>
    </label>
  );
};

export const QuestionRenderer = ({
  question,
  onSelectOption,
  onNumericalChange,
  onClearResponse,
  onToggleMarkForReview,
  onNext,
  onPrevious,
  disablePrevious,
  disableNext,
}: QuestionRendererProps) => {
  const isNumerical = question.questionType === "numerical";
  const radioName = `question-${question.id}`;

  return (
    <div className="flex h-screen flex-col bg-white">
      {/* Sticky Header */}
      <div className="sticky top-0 z-10 border-b border-gray-200 bg-white px-1 py-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <div className="flex flex-wrap items-center gap-5">
            <span className="text-sm font-semibold text-gray-700">
              Question {question.questionNumber}
            </span>
            <span
              className={`border-0 px-3 py-1 text-xs font-semibold ${getSubjectBadgeClasses(
                question.subject,
              )}`}
            >
              {question.subject}
            </span>
            {question.difficulty ? (
              <span
                className={`border-0 px-3 py-1 text-xs font-semibold ${getDifficultyBadgeClasses(
                  question.difficulty,
                )}`}
              >
                {question.difficulty.charAt(0).toUpperCase() +
                  question.difficulty.slice(1)}
              </span>
            ) : null}
            {question.isMarkedForReview ? (
              <span className="border-0 border-orange-200 bg-orange-50 px-3 py-1 text-xs font-semibold text-orange-700">
                Marked for Review
              </span>
            ) : null}
          </div>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-4xl space-y-6 px-4 py-6 sm:px-6 lg:px-8">
          {/* Question area */}
          <section className="border border-gray-200 p-5 sm:p-6">
            {question.questionImageUrl ? (
              <QuestionImage
                src={question.questionImageUrl}
                alt={`Question ${question.questionNumber}`}
                allowScroll
              />
            ) : null}
            {question.questionText ? (
              <MathContent content={question.questionText} />
            ) : null}
          </section>

          {/* Response area */}
          <section className="space-y-4">
            {isNumerical ? (
              <div className="rounded-xl border border-gray-200 p-4 sm:p-5">
                <label
                  className="block text-sm font-semibold text-gray-700"
                  htmlFor="numerical-answer"
                >
                  Numerical Answer
                </label>
                <input
                  id="numerical-answer"
                  type="text"
                  inputMode="decimal"
                  placeholder="Enter your answer"
                  value={question.numericalAnswer ?? ""}
                  onChange={(event) => onNumericalChange(event.target.value)}
                  className="mt-3 h-12 w-full rounded-lg border border-gray-300 px-4 text-base text-gray-900 outline-none transition focus:border-gray-500 focus:ring-2 focus:ring-gray-200"
                />
              </div>
            ) : (
              <div className="space-y-2">
                {(question.options ?? []).map((option) => (
                  <OptionCard
                    key={option.id}
                    option={option}
                    isSelected={option.id === question.selectedOptionId}
                    onSelect={() => onSelectOption(option.id)}
                    name={radioName}
                  />
                ))}
              </div>
            )}
          </section>
        </div>
      </div>

      {/* Sticky Footer */}
      <div className="sticky bottom-0 z-10 border-t border-gray-200 bg-white px-4 py-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={onClearResponse}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 transition hover:border-gray-400 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-300"
              >
                Clear Response
              </button>
              <button
                type="button"
                onClick={onToggleMarkForReview}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 transition hover:border-gray-400 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-300"
              >
                {question.isMarkedForReview ? "Unmark Review" : "Mark for Review"}
              </button>
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={onPrevious}
                disabled={disablePrevious}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 transition hover:border-gray-400 hover:text-gray-900 disabled:cursor-not-allowed disabled:border-gray-200 disabled:text-gray-400"
              >
                Previous
              </button>
              <button
                type="button"
                onClick={onNext}
                disabled={disableNext}
                className="rounded-lg border border-gray-800 bg-gray-800 px-4 py-2 text-sm font-semibold text-white transition hover:bg-gray-700 disabled:cursor-not-allowed disabled:border-gray-300 disabled:bg-gray-300"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const sampleQuestion: Question = {
  id: 101,
  questionNumber: 12,
  subject: "Mathematics",
  difficulty: "medium",
  questionText:
    "If \\((x^2 + y^2 = 1)\\), find the maximum value of \\(x + y\\).\\n\\n\\[x, y \\ge 0\\]",
  questionImageUrl: null,
  questionType: "single_correct",
  options: [
    { id: 1, label: "A", optionText: "\\(1\\)" },
    { id: 2, label: "B", optionText: "\\(\\sqrt{2}\\)" },
    { id: 3, label: "C", optionText: "\\(2\\)" },
    { id: 4, label: "D", optionText: "\\(\\frac{3}{2}\\)" },
  ],
  selectedOptionId: null,
  numericalAnswer: "",
  isMarkedForReview: false,
};

const QuestionRendererDemo = () => {
  const [question, setQuestion] = React.useState<Question>(sampleQuestion);

  return (
    <QuestionRenderer
      question={question}
      onSelectOption={(optionId) =>
        setQuestion((current) => ({ ...current, selectedOptionId: optionId }))
      }
      onNumericalChange={(value) =>
        setQuestion((current) => ({ ...current, numericalAnswer: value }))
      }
      onClearResponse={() =>
        setQuestion((current) => ({
          ...current,
          selectedOptionId: null,
          numericalAnswer: "",
        }))
      }
      onToggleMarkForReview={() =>
        setQuestion((current) => ({
          ...current,
          isMarkedForReview: !current.isMarkedForReview,
        }))
      }
      onNext={() => null}
      onPrevious={() => null}
      disablePrevious
      disableNext
    />
  );
};

export default QuestionRendererDemo;
