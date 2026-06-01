import type { SubjectSummary } from "./types";

type SubjectAnalysisProps = {
  subjects: SubjectSummary[];
  weakestSubjectId?: number;
  headingClassName?: string;
};

export const SubjectAnalysis = ({
  subjects,
  weakestSubjectId,
  headingClassName,
}: SubjectAnalysisProps) => {
  return (
    <section aria-labelledby="subject-analysis" className="mt-12">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2
            id="subject-analysis"
            className={`${headingClassName ?? ""} text-2xl font-semibold text-slate-900`}
          >
            Subject Analysis
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            Compare your performance across subjects to identify focus areas.
          </p>
        </div>
        <p className="text-sm text-slate-500">
          Weakest subject is highlighted
        </p>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {subjects.map((subject) => {
          const isWeakest = subject.id === weakestSubjectId;
          return (
            <div
              key={subject.id}
              className={`rounded-2xl border bg-white p-5 shadow-sm ${
                isWeakest
                  ? "border-rose-200 ring-2 ring-rose-200/60"
                  : "border-slate-200"
              }`}
            >
              <div className="flex items-start justify-between">
                <h3 className="text-lg font-semibold text-slate-900">
                  {subject.name}
                </h3>
                {isWeakest ? (
                  <span className="rounded-full bg-rose-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.15em] text-rose-700">
                    Focus
                  </span>
                ) : null}
              </div>
              <p className="mt-4 text-3xl font-semibold text-slate-900">
                {subject.score}
              </p>
              <div className="mt-3 flex flex-wrap gap-4 text-sm text-slate-600">
                <span>
                  <span className="font-semibold text-emerald-700">
                    {subject.correct}
                  </span>{" "}
                  correct
                </span>
                <span>
                  <span className="font-semibold text-rose-700">
                    {subject.wrong}
                  </span>{" "}
                  wrong
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
