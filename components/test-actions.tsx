"use client";

type TestActionsProps = {
  onPrevious: () => void;
  onNext: () => void;
  onSaveNext: () => void;
  onClearResponse: () => void;
  onMarkForReview: () => void;
  onSaveMarkForReview: () => void;
  disablePrevious?: boolean;
  disableNext?: boolean;
  isMarkedForReview?: boolean;
};

const baseButton =
  "h-11 w-full min-w-[140px] rounded-md border px-4 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-gray-300 sm:w-auto";

const secondaryButton =
  `${baseButton} border-gray-300 text-gray-700 hover:border-gray-400 hover:text-gray-900`;

const primaryButton =
  `${baseButton} border-gray-800 bg-gray-800 text-white hover:bg-gray-700`;

const subtleButton =
  `${baseButton} border-gray-200 bg-gray-50 text-gray-700 hover:border-gray-300`;

export const TestActions = ({
  onPrevious,
  onNext,
  onSaveNext,
  onClearResponse,
  onMarkForReview,
  onSaveMarkForReview,
  disablePrevious,
  disableNext,
  isMarkedForReview,
}: TestActionsProps) => {
  return (
    <div className="sticky bottom-0 z-10 border-t border-gray-200 bg-white">
      <div className="mx-auto max-w-5xl space-y-3 px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap gap-3">
          <button type="button" onClick={onSaveNext} className={primaryButton}>
            Save & Next
          </button>
          <button type="button" onClick={onClearResponse} className={secondaryButton}>
            Clear Response
          </button>
          <button
            type="button"
            onClick={onSaveMarkForReview}
            className={subtleButton}
          >
            Save & Mark for Review
          </button>
          <button type="button" onClick={onMarkForReview} className={secondaryButton}>
            {isMarkedForReview ? "Unmark Review" : "Mark for Review"}
          </button>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={onPrevious}
              disabled={disablePrevious}
              className={`${secondaryButton} disabled:cursor-not-allowed disabled:border-gray-200 disabled:text-gray-400`}
            >
              Previous
            </button>
            <button
              type="button"
              onClick={onNext}
              disabled={disableNext}
              className={`${secondaryButton} disabled:cursor-not-allowed disabled:border-gray-200 disabled:text-gray-400`}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
