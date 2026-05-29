import type { AttemptAnswer, Question, QuestionStatus } from "../types";

const isAnswered = (answer: AttemptAnswer) => {
  const hasOption = answer.selectedOptionId !== null &&
    answer.selectedOptionId !== undefined;
  const hasNumerical = (answer.numericalAnswer ?? "").trim().length > 0;
  return hasOption || hasNumerical;
};

export const createEmptyAnswer = (questionId: number): AttemptAnswer => ({
  questionId,
  selectedOptionId: null,
  numericalAnswer: "",
  isMarkedForReview: false,
  visited: false,
  answered: false,
});

export const normalizeAnswer = (answer: AttemptAnswer): AttemptAnswer => ({
  ...answer,
  answered: isAnswered(answer),
});

export const buildAnswerMap = (
  questions: Question[],
  initialAnswers?: Record<number, AttemptAnswer>,
) => {
  const map: Record<number, AttemptAnswer> = {};

  for (const question of questions) {
    const existing = initialAnswers?.[question.id];
    map[question.id] = normalizeAnswer(
      existing ? { ...existing, questionId: question.id } : createEmptyAnswer(question.id),
    );
  }

  return map;
};

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
