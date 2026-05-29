"use client";

import Image from "next/image";
import type { QuestionStatus } from "./types";
import {
  QUESTION_STATUS_ICONS,
  QUESTION_STATUS_LABELS,
} from "./utils/question-palette";

type QuestionStatusBadgeProps = {
  status: QuestionStatus;
  number: number;
  isCurrent?: boolean;
  onClick?: () => void;
};

export const QuestionStatusBadge = ({
  status,
  number,
  isCurrent,
  onClick,
}: QuestionStatusBadgeProps) => {
  const iconSrc = QUESTION_STATUS_ICONS[status];
  const label = QUESTION_STATUS_LABELS[status];

  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative flex h-10 w-12 items-center justify-center rounded-md transition focus:outline-none focus:ring-2 focus:ring-blue-400 ${
        isCurrent
          ? "ring-2 ring-blue-500 ring-offset-2"
          : "ring-1 ring-transparent hover:ring-gray-300"
      }`}
      aria-label={`Question ${number}. ${label}. ${
        isCurrent ? "Current question" : "Go to question"
      }`}
      aria-current={isCurrent ? "true" : undefined}
    >
      <Image
        src={iconSrc}
        alt=""
        width={48}
        height={36}
        className="h-10 w-12"
        priority={false}
      />
      <span className="absolute inset-0 flex items-center justify-center text-sm font-semibold text-white pointer-events-none">
        {number}
      </span>
    </button>
  );
};
