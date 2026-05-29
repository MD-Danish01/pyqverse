export type QuestionDifficulty = "easy" | "medium" | "hard";

export type QuestionType = "single_correct" | "numerical";

export type QuestionOptionLabel = "A" | "B" | "C" | "D";

export type QuestionOption = {
  id: number;
  label: QuestionOptionLabel;
  optionText?: string | null;
  optionImageUrl?: string | null;
};

export type Question = {
  id: number;
  questionNumber: number;
  subject: string;
  difficulty?: QuestionDifficulty;
  questionText?: string | null;
  questionImageUrl?: string | null;
  questionType: QuestionType;
  options?: QuestionOption[];
};

export type AttemptAnswer = {
  questionId: number;
  selectedOptionId?: number | null;
  numericalAnswer?: string;
  isMarkedForReview: boolean;
  visited: boolean;
  answered: boolean;
};

export type QuestionStatus =
  | "not_visited"
  | "not_answered"
  | "answered"
  | "marked_for_review"
  | "answered_and_review";
