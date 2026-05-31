export type ExamHeaderProps = {
  examName: string;
  examType: string;
  remainingSeconds: number;
};

export const formatTime = (seconds: number) => {
  const safeSeconds = Number.isFinite(seconds)
    ? Math.max(0, Math.floor(seconds))
    : 0;
  const hours = Math.floor(safeSeconds / 3600);
  const minutes = Math.floor((safeSeconds % 3600) / 60);
  const secs = safeSeconds % 60;

  return [hours, minutes, secs]
    .map((value) => String(value).padStart(2, "0"))
    .join(":");
};

export const ExamHeader = ({
  examName,
  examType,
  remainingSeconds,
}: ExamHeaderProps) => {
  const formattedTime = formatTime(remainingSeconds);
  const isLowTime = remainingSeconds > 0 && remainingSeconds < 10 * 60;
  const timerTextClass = isLowTime ? "text-amber-700" : "text-gray-900";
  const timerLabelClass = isLowTime ? "text-amber-700" : "text-gray-600";
  const timerContainerClass = isLowTime
    ? "border-amber-200 bg-amber-50"
    : "border-gray-200 bg-white";

  return (
    <header className="rounded-lg border border-gray-200 bg-gray-50 p-4">
      <div className="space-y-2">
        <div>
          <h2 className="text-base font-semibold text-gray-900">
            {examName}
          </h2>
          <p className="text-sm text-gray-600">{examType}</p>
        </div>
        <div
          className={`flex items-center gap-2 rounded-md border px-3 py-2 ${timerContainerClass}`}
        >
          <time
            className={`text-xl font-bold font-mono tabular-nums whitespace-nowrap ${timerTextClass}`}
            role="timer"
            aria-live="polite"
            aria-atomic="true"
            aria-label={`Remaining time ${formattedTime}`}
          >
            {formattedTime}
          </time>
          <span className={`text-sm font-semibold ${timerLabelClass}`}>
            Remaining
          </span>
        </div>
      </div>
    </header>
  );
};
