export type QuestionStatus = "correct" | "wrong" | "unattempted";

export type QuestionReviewItem = {
  id: number;
  order: number;
  subjectId: number;
  subject: string;
  status: QuestionStatus;
  questionText: string | null;
  questionImageUrl: string | null;
  questionType: "single_correct" | "numerical";
  studentAnswerLabel: string | null;
  studentAnswerText: string | null;
  correctAnswerLabel: string | null;
  correctAnswerText: string | null;
  marksAwarded: number;
  solutionText: string | null;
  solutionImageUrl: string | null;
  isMarkedForReview: boolean;
};

export type PerformanceSummary = {
  correct: number;
  wrong: number;
  unattempted: number;
  accuracy: number;
};

export type SubjectSummary = {
  id: number;
  name: string;
  score: number;
  correct: number;
  wrong: number;
};

export type StatusCounts = {
  all: number;
  correct: number;
  wrong: number;
  unattempted: number;
};
