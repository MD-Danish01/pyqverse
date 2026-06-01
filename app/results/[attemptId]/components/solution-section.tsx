"use client";

import { useId, useState } from "react";
import Image from "next/image";

type SolutionSectionProps = {
  solutionText: string | null;
  solutionImageUrl: string | null;
};

export const SolutionSection = ({
  solutionText,
  solutionImageUrl,
}: SolutionSectionProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const contentId = useId();
  const hasSolution = Boolean(solutionText || solutionImageUrl);

  return (
    <div className="mt-6 border-t border-slate-200 pt-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
          Solution
        </p>
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          aria-expanded={isOpen}
          aria-controls={contentId}
          disabled={!hasSolution}
          className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
            hasSolution
              ? "border-slate-900 bg-slate-900 text-white hover:bg-slate-800"
              : "border-slate-200 bg-slate-100 text-slate-400"
          }`}
        >
          {isOpen ? "Hide Solution" : "Show Solution"}
        </button>
      </div>

      {!hasSolution ? (
        <p className="mt-3 text-sm text-slate-500">
          Solution is not available yet. Keep practicing and revisit later.
        </p>
      ) : null}

      {hasSolution && isOpen ? (
        <div id={contentId} className="mt-4 space-y-4 text-slate-700">
          {solutionText ? (
            <p className="text-base leading-relaxed">{solutionText}</p>
          ) : null}
          {solutionImageUrl ? (
            <Image
              src={solutionImageUrl}
              alt="Solution illustration"
              className="h-auto w-auto object-contain"
              width={800}
              height={600}
              loading="lazy"
            />
          ) : null}
        </div>
      ) : null}
    </div>
  );
};
