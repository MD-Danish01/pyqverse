import type { PerformanceSummary } from "./types";

type PerformanceOverviewProps = {
  summary: PerformanceSummary;
  headingClassName?: string;
};

const summaryItems = [
  { key: "correct", label: "Correct", tone: "text-emerald-700" },
  { key: "wrong", label: "Wrong", tone: "text-rose-700" },
  { key: "unattempted", label: "Unattempted", tone: "text-slate-700" },
  { key: "accuracy", label: "Accuracy", tone: "text-slate-900" },
] as const;

export const PerformanceOverview = ({
  summary,
  headingClassName,
}: PerformanceOverviewProps) => {
  return (
    <section aria-labelledby="performance-summary" className="mt-12">
      <div className="flex items-center justify-between">
        <h2
          id="performance-summary"
          className={`${headingClassName ?? ""} text-2xl font-semibold text-slate-900`}
        >
          Overall Performance
        </h2>
        <p className="text-sm text-slate-500">
          A quick snapshot of your attempt
        </p>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {summaryItems.map((item) => {
          const value =
            item.key === "accuracy"
              ? `${summary.accuracy.toFixed(2)}%`
              : summary[item.key];
          return (
            <div
              key={item.key}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                {item.label}
              </p>
              <p className={`mt-3 text-3xl font-semibold ${item.tone}`}>
                {value}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
};
