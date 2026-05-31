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
  onSubmit?: () => void | Promise<void>;
  isSubmitting?: boolean;
  submitLabel?: string;
};

const baseButton =
  "h-9 px-3 py-1 text-sm font-semibold border rounded transition focus:outline-none disabled:cursor-not-allowed";

const greenButton =
  `${baseButton} bg-green-500 text-white border-green-500 hover:bg-green-600 disabled:bg-gray-300 disabled:border-gray-300`;

const outlineButton =
  `${baseButton} bg-white text-gray-700 border-gray-300 hover:border-gray-400 hover:text-gray-900 disabled:text-gray-400 disabled:border-gray-200`;

const orangeButton =
  `${baseButton} bg-orange-400 text-white border-orange-400 hover:bg-orange-500`;

const blueButton =
  `${baseButton} bg-blue-500 text-white border-blue-500 hover:bg-blue-600`;

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
  onSubmit,
  isSubmitting,
  submitLabel = "Submit Test",
}: TestActionsProps) => {
  return (
    <div className="sticky bottom-0 z-10 border-t px-20 md:px-6 lg:px-20 border-gray-200 bg-white">
      <div className="mx-auto space-y-2 px-4 py-3 sm:px-6 lg:px-8">
        {/* Row 1: Save & Next, Clear, Save & Mark for Review, Mark for Review & Next */}
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={onSaveNext} className={greenButton}>
            SAVE & NEXT
          </button>
          <button type="button" onClick={onClearResponse} className={outlineButton}>
            CLEAR
          </button>
          <button type="button" onClick={onSaveMarkForReview} className={orangeButton}>
            SAVE & MARK FOR REVIEW
          </button>
          <button type="button" onClick={onMarkForReview} className={blueButton}>
            {isMarkedForReview ? "UNMARK REVIEW" : "MARK FOR REVIEW & NEXT"}
          </button>
        </div>

        {/* Row 2: Back, Next, Submit */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onPrevious}
              disabled={disablePrevious}
              className={outlineButton}
            >
              &lt;&lt; BACK
            </button>
            <button
              type="button"
              onClick={onNext}
              disabled={disableNext}
              className={outlineButton}
            >
              NEXT &gt;&gt;
            </button>
          </div>
          {onSubmit ? (
            <button
              type="button"
              onClick={onSubmit}
              disabled={isSubmitting}
              className={greenButton}
            >
              {isSubmitting ? "SUBMITTING..." : "SUBMIT"}
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
};
