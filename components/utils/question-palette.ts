import type { AttemptAnswer, Question, QuestionStatus } from "../types";

export const QUESTION_STATUS_ICONS: Record<QuestionStatus, string> = {
  not_visited: "/not_visited.png",
  not_answered: "/not_answered.png",
  answered: "/answered.png",
  marked_for_review: "/marked_for_review.png",
  answered_and_review: "/answered_and_marked_for_review.png",
};

export const QUESTION_STATUS_LABELS: Record<QuestionStatus, string> = {
  not_visited: "Not Visited",
  not_answered: "Not Answered",
  answered: "Answered",
  marked_for_review: "Marked for Review",
  answered_and_review: "Answered & Marked for Review",
};

export const QUESTION_STATUS_ORDER: QuestionStatus[] = [
  "not_visited",
  "not_answered",
  "answered",
  "marked_for_review",
  "answered_and_review",
];

export const getQuestionStatus = (answer?: AttemptAnswer): QuestionStatus => {
  if (!answer || !answer.visited) {
    return "not_visited";
  }

  if (answer.isMarkedForReview && answer.answered) {
    return "answered_and_review";
  }

  if (answer.isMarkedForReview) {
    return "marked_for_review";
  }

  if (answer.answered) {
    return "answered";
  }

  return "not_answered";
};

export const buildStatusCounts = (
  questions: Question[],
  answers: Record<number, AttemptAnswer>,
): Record<QuestionStatus, number> => {
  const counts: Record<QuestionStatus, number> = {
    not_visited: 0,
    not_answered: 0,
    answered: 0,
    marked_for_review: 0,
    answered_and_review: 0,
  };

  for (const question of questions) {
    const status = getQuestionStatus(answers[question.id]);
    counts[status] += 1;
  }

  return counts;
};
