"use client";

import type { QuestionStatus, StatusCounts } from "./types";

type SubjectOption = {
  id: number;
  name: string;
};

type QuestionReviewFiltersProps = {
  subjects: SubjectOption[];
  statusCounts: StatusCounts;
  activeStatus: "all" | QuestionStatus;
  activeSubject: number | "all";
  onStatusChange: (status: "all" | QuestionStatus) => void;
  onSubjectChange: (subjectId: number | "all") => void;
};

const statusOptions: Array<{
  value: "all" | QuestionStatus;
  label: string;
  tone: string;
}> = [
  { value: "all", label: "All Questions", tone: "text-slate-700" },
  { value: "correct", label: "Correct", tone: "text-emerald-700" },
  { value: "wrong", label: "Wrong", tone: "text-rose-700" },
  { value: "unattempted", label: "Unattempted", tone: "text-slate-600" },
];

export const QuestionReviewFilters = ({
  subjects,
  statusCounts,
  activeStatus,
  activeSubject,
  onStatusChange,
  onSubjectChange,
}: QuestionReviewFiltersProps) => {
  return (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-3">
        {statusOptions.map((option) => {
          const count = statusCounts[option.value === "all" ? "all" : option.value];
          const isActive = activeStatus === option.value;
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onStatusChange(option.value)}
              aria-pressed={isActive}
              className={`flex items-center gap-3 rounded-full border px-4 py-2 text-sm font-semibold transition ${
                isActive
                  ? "border-slate-900 bg-slate-900 text-white"
                  : "border-slate-200 bg-white text-slate-700 hover:border-slate-400"
              }`}
            >
              <span className={isActive ? "text-white" : option.tone}>
                {option.label}
              </span>
              <span
                className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                  isActive
                    ? "bg-white/20 text-white"
                    : "bg-slate-100 text-slate-600"
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      <div className="flex flex-wrap gap-2" role="tablist" aria-label="Subject filters">
        <button
          type="button"
          role="tab"
          aria-selected={activeSubject === "all"}
          onClick={() => onSubjectChange("all")}
          className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
            activeSubject === "all"
              ? "border-slate-900 bg-slate-900 text-white"
              : "border-slate-200 bg-white text-slate-700 hover:border-slate-400"
          }`}
        >
          All Subjects
        </button>
        {subjects.map((subject) => (
          <button
            key={subject.id}
            type="button"
            role="tab"
            aria-selected={activeSubject === subject.id}
            onClick={() => onSubjectChange(subject.id)}
            className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
              activeSubject === subject.id
                ? "border-slate-900 bg-slate-900 text-white"
                : "border-slate-200 bg-white text-slate-700 hover:border-slate-400"
            }`}
          >
            {subject.name}
          </button>
        ))}
      </div>
    </div>
  );
};
