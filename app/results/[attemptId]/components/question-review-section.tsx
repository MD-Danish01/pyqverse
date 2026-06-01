"use client";

import { useMemo, useState } from "react";
import type { QuestionReviewItem, QuestionStatus, StatusCounts } from "./types";
import { QuestionReviewFilters } from "./question-review-filters";
import { QuestionReviewCard } from "./question-review-card";

type SubjectOption = {
  id: number;
  name: string;
};

type QuestionReviewSectionProps = {
  items: QuestionReviewItem[];
  subjects: SubjectOption[];
  statusCounts: StatusCounts;
  headingClassName?: string;
};

export const QuestionReviewSection = ({
  items,
  subjects,
  statusCounts,
  headingClassName,
}: QuestionReviewSectionProps) => {
  const [statusFilter, setStatusFilter] = useState<"all" | QuestionStatus>(
    "all",
  );
  const [subjectFilter, setSubjectFilter] = useState<number | "all">("all");

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const statusMatch =
        statusFilter === "all" || item.status === statusFilter;
      const subjectMatch =
        subjectFilter === "all" || item.subjectId === subjectFilter;
      return statusMatch && subjectMatch;
    });
  }, [items, statusFilter, subjectFilter]);

  return (
    <section aria-labelledby="question-review" className="mt-12">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2
            id="question-review"
            className={`${headingClassName ?? ""} text-2xl font-semibold text-slate-900`}
          >
            Question Review
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            Focus on mistakes and learn the correct approach before revisiting the
            solutions.
          </p>
        </div>
        <p className="text-sm text-slate-500">
          Showing {filteredItems.length} of {items.length}
        </p>
      </div>

      <div className="mt-6 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <QuestionReviewFilters
          subjects={subjects}
          statusCounts={statusCounts}
          activeStatus={statusFilter}
          activeSubject={subjectFilter}
          onStatusChange={setStatusFilter}
          onSubjectChange={setSubjectFilter}
        />
      </div>

      <div className="mt-6 space-y-6">
        {filteredItems.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-sm text-slate-500">
            No questions match the selected filters.
          </div>
        ) : (
          filteredItems.map((item) => (
            <QuestionReviewCard key={item.id} item={item} />
          ))
        )}
      </div>
    </section>
  );
};
