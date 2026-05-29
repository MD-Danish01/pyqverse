"use client";

import Image from "next/image";
import type { QuestionStatus } from "./types";
import {
  QUESTION_STATUS_ICONS,
  QUESTION_STATUS_LABELS,
  QUESTION_STATUS_ORDER,
} from "./utils/question-palette";

type PaletteLegendProps = {
  counts: Record<QuestionStatus, number>;
};

export const PaletteLegend = ({ counts }: PaletteLegendProps) => {
  return (
    <div className="grid grid-cols-2 gap-3 text-xs text-gray-700">
      {QUESTION_STATUS_ORDER.map((status) => (
        <div key={status} className="flex items-center gap-2">
          <Image
            src={QUESTION_STATUS_ICONS[status]}
            alt=""
            width={24}
            height={18}
            className="h-5 w-6"
          />
          <span className="font-semibold text-gray-900">{counts[status]}</span>
          <span className="text-gray-600">{QUESTION_STATUS_LABELS[status]}</span>
        </div>
      ))}
    </div>
  );
};
