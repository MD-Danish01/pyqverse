import { describe, it, expect } from 'vitest';

/**
 * JEE Main Scoring Rules:
 * - Correct Answer: +4 marks
 * - Wrong Answer: -1 mark
 * - Unattempted: 0 marks
 * - Accuracy: (correctCount / totalQuestions) * 100
 */

describe('Score Calculation', () => {
  const calculateScore = (
    correctCount: number,
    wrongCount: number,
    totalQuestions: number
  ) => {
    const marksPerQuestion = 4;
    const negativeMarks = -1;
    const score = correctCount * marksPerQuestion + wrongCount * negativeMarks;
    const accuracy = totalQuestions > 0 ? (correctCount / totalQuestions) * 100 : 0;
    return { score, accuracy };
  };

  describe('Basic Scoring (JEE Main: +4, -1)', () => {
    it('should award 4 marks for correct answer', () => {
      const { score } = calculateScore(1, 0, 1);
      expect(score).toBe(4);
    });

    it('should deduct 1 mark for wrong answer', () => {
      const { score } = calculateScore(0, 1, 1);
      expect(score).toBe(-1);
    });

    it('should award 0 marks for unattempted question', () => {
      const { score } = calculateScore(0, 0, 1);
      expect(score).toBe(0);
    });
  });

  describe('Combined Scoring', () => {
    it('should calculate combined score correctly: 2 correct, 1 wrong, 2 unattempted', () => {
      const { score } = calculateScore(2, 1, 5);
      expect(score).toBe(2 * 4 + 1 * -1); // 8 - 1 = 7
      expect(score).toBe(7);
    });

    it('should calculate combined score: 3 correct, 2 wrong, 0 unattempted', () => {
      const { score } = calculateScore(3, 2, 5);
      expect(score).toBe(3 * 4 + 2 * -1); // 12 - 2 = 10
      expect(score).toBe(10);
    });

    it('should handle negative final score (all wrong)', () => {
      const { score } = calculateScore(0, 5, 5);
      expect(score).toBe(-5);
    });
  });

  describe('Accuracy Calculation', () => {
    it('should calculate accuracy as percentage: 3 correct out of 5 = 60%', () => {
      const { accuracy } = calculateScore(3, 0, 5);
      expect(accuracy).toBe(60);
    });

    it('should calculate 100% accuracy (all correct)', () => {
      const { accuracy } = calculateScore(5, 0, 5);
      expect(accuracy).toBe(100);
    });

    it('should calculate 0% accuracy (none correct)', () => {
      const { accuracy } = calculateScore(0, 5, 5);
      expect(accuracy).toBe(0);
    });

    it('should calculate 50% accuracy: 2 correct out of 4', () => {
      const { accuracy } = calculateScore(2, 0, 4);
      expect(accuracy).toBe(50);
    });

    it('should calculate fractional accuracy: 1 correct out of 3', () => {
      const { accuracy } = calculateScore(1, 0, 3);
      expect(accuracy).toBeCloseTo(33.33, 2);
    });
  });

  describe('Real Exam Scenarios', () => {
    it('should handle real exam: 15 correct, 5 wrong, 0 unattempted', () => {
      const { score, accuracy } = calculateScore(15, 5, 20);
      expect(score).toBe(55); // 15*4 - 5*1 = 60 - 5
      expect(accuracy).toBe(75); // 15/20 = 0.75
    });

    it('should handle mixed attempt: 10 correct, 3 wrong, 7 unattempted', () => {
      const { score, accuracy } = calculateScore(10, 3, 20);
      expect(score).toBe(37); // 10*4 - 3*1 = 40 - 3
      expect(accuracy).toBe(50); // 10/20
    });

    it('should handle edge case: 0 questions', () => {
      const { score, accuracy } = calculateScore(0, 0, 0);
      expect(score).toBe(0);
      expect(accuracy).toBe(0);
    });
  });

  describe('Accuracy Precision', () => {
    it('should return accurate decimal for 1/3', () => {
      const { accuracy } = calculateScore(1, 0, 3);
      expect(accuracy).toBeCloseTo(33.333, 2);
    });

    it('should return accurate decimal for 2/3', () => {
      const { accuracy } = calculateScore(2, 0, 3);
      expect(accuracy).toBeCloseTo(66.667, 2);
    });

    it('should return accurate decimal for 1/6', () => {
      const { accuracy } = calculateScore(1, 0, 6);
      expect(accuracy).toBeCloseTo(16.667, 2);
    });
  });
});
