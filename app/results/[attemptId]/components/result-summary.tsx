type ResultSummaryProps = {
  examName: string;
  submittedLabel: string;
  timeUsedLabel: string;
  scoreLabel: string;
  headingClassName?: string;
};

export const ResultSummary = ({
  examName,
  submittedLabel,
  timeUsedLabel,
  scoreLabel,
  headingClassName,
}: ResultSummaryProps) => {
  return (
    <section
      aria-labelledby="result-overview"
      className="rounded-3xl border border-slate-200/80 bg-white/80 p-6 shadow-sm backdrop-blur sm:p-8"
    >
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-3">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
              Result Overview
            </p>
            <h1
              id="result-overview"
              className={`${headingClassName ?? ""} text-3xl font-semibold text-slate-900 sm:text-4xl`}
            >
              {examName}
            </h1>
          </div>
          <div className="flex flex-wrap gap-4 text-sm text-slate-600">
            <p>
              <span className="font-semibold text-slate-700">Submitted on:</span>{" "}
              {submittedLabel}
            </p>
            <p>
              <span className="font-semibold text-slate-700">Time Used:</span>{" "}
              {timeUsedLabel}
            </p>
          </div>
        </div>
        <div className="rounded-2xl border border-slate-200/70 bg-slate-900 px-6 py-5 text-white shadow-lg shadow-slate-900/20">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-200">
            Final Score
          </p>
          <p
            className={`${headingClassName ?? ""} mt-3 text-4xl font-semibold sm:text-5xl`}
          >
            {scoreLabel}
          </p>
        </div>
      </div>
    </section>
  );
};
