import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import {
  attemptAnswers,
  questionOptions,
  questions,
  testAttempts,
  testQuestions,
} from "@/db/schema";
import { and, eq, inArray } from "drizzle-orm";

type StudentResponse = {
  questionId: number;
  selectedOptionId: number | null;
  numericalAnswer: string | null;
  isMarkedForReview: boolean;
};

type AttemptAnswerInsert = typeof attemptAnswers.$inferInsert;

export async function POST(request: NextRequest) {
  const { attemptId, userId, studentResponses, submittedAt } =
    await request.json();

  console.log("Received attemptId:", attemptId);
  console.log("Received studentResponses:", studentResponses);

  const attemptIdNumber = Number(attemptId);
  const userIdNumber = Number(userId);

  if (!attemptId || Number.isNaN(attemptIdNumber)) {
    return NextResponse.json({ error: "Invalid attemptId" }, { status: 400 });
  }

  if (!userId || Number.isNaN(userIdNumber)) {
    return NextResponse.json({ error: "Invalid userId" }, { status: 400 });
  }

  if (!Array.isArray(studentResponses)) {
    return NextResponse.json({ error: "Invalid responses" }, { status: 400 });
  }

  try {
    const result = await db.transaction(async (tx) => {
      const [attempt] = await tx
        .select({
          id: testAttempts.id,
          attemptStatus: testAttempts.attemptStatus,
        })
        .from(testAttempts)
        .where(
          and(
            eq(testAttempts.id, attemptIdNumber),
            eq(testAttempts.userId, userIdNumber),
          ),
        );

      if (!attempt) {
        return { error: "Attempt not found", status: 404 };
      }

      if (attempt.attemptStatus !== "in_progress") {
        return { error: "Attempt is not in progress", status: 409 };
      }

      const lockedQuestions = await tx
        .select({
          testQuestionId: testQuestions.id,
          questionId: testQuestions.questionId,
        })
        .from(testQuestions)
        .where(eq(testQuestions.attemptId, attemptIdNumber));

      if (lockedQuestions.length === 0) {
        return { error: "No questions locked for this attempt", status: 404 };
      }

      const lockedQuestionIds = lockedQuestions.map(
        (locked) => locked.questionId,
      );

      const responseByQuestionId = new Map<number, StudentResponse>();
      for (const response of studentResponses as StudentResponse[]) {
        if (!lockedQuestionIds.includes(response.questionId)) {
          return {
            error: "Response contains questions not in this attempt",
            status: 400,
          };
        }
        responseByQuestionId.set(response.questionId, response);
      }

      const questionRows = await tx
        .select({
          id: questions.id,
          marks: questions.marks,
          negativeMarks: questions.negativeMarks,
          questionType: questions.questionType,
          correctAnswerText: questions.correctAnswerText,
        })
        .from(questions)
        .where(inArray(questions.id, lockedQuestionIds));

      if (questionRows.length !== lockedQuestionIds.length) {
        return {
          error: "Locked questions are missing in the questions table",
          status: 500,
        };
      }

      const options = await tx
        .select({
          id: questionOptions.id,
          questionId: questionOptions.questionId,
          isCorrect: questionOptions.isCorrect,
        })
        .from(questionOptions)
        .where(inArray(questionOptions.questionId, lockedQuestionIds));

      const questionMap = new Map(
        questionRows.map((row) => [row.id, row]),
      );

      const correctOptionByQuestionId: Record<number, number | null> = {};
      for (const option of options) {
        if (option.isCorrect) {
          correctOptionByQuestionId[option.questionId] = option.id;
        }
      }

      let totalScore = 0;
      let correctCount = 0;
      let wrongCount = 0;
      let unattemptedCount = 0;

      const answerRows: AttemptAnswerInsert[] = lockedQuestions.flatMap(
        (locked) => {
        const question = questionMap.get(locked.questionId);
        if (!question) {
          return [];
        }

        const response = responseByQuestionId.get(locked.questionId);
        const selectedOptionId = response?.selectedOptionId ?? null;
        const numericalAnswer = (response?.numericalAnswer ?? "").trim();
        const hasOption =
          selectedOptionId !== null && selectedOptionId !== undefined;
        const hasNumerical = numericalAnswer.length > 0;
        const isAttempted = hasOption || hasNumerical;

        let isCorrect = false;
        if (isAttempted) {
          if (question.questionType === "single_correct") {
            const correctOptionId =
              correctOptionByQuestionId[locked.questionId] ?? null;
            isCorrect =
              hasOption &&
              correctOptionId !== null &&
              selectedOptionId === correctOptionId;
          } else if (question.questionType === "numerical") {
            const correctText = (question.correctAnswerText ?? "").trim();
            isCorrect = correctText.length > 0 && numericalAnswer === correctText;
          }
        }

        let marksAwarded = 0;
        if (isAttempted) {
          marksAwarded = isCorrect ? question.marks : question.negativeMarks;
          if (isCorrect) {
            correctCount += 1;
          } else {
            wrongCount += 1;
          }
        } else {
          unattemptedCount += 1;
        }

        totalScore += marksAwarded;

        return [
          {
          attemptId: attemptIdNumber,
          testQuestionId: locked.testQuestionId,
          questionId: locked.questionId,
          selectedOptionId: hasOption ? selectedOptionId : null,
          answerText: hasNumerical ? numericalAnswer : null,
          isCorrect,
          isAttempted,
          isMarkedForReview: response?.isMarkedForReview ?? false,
          timeSpentSeconds: 0,
          marksAwarded,
          },
        ];
      },
      );

      if (answerRows.length > 0) {
        await tx.insert(attemptAnswers).values(answerRows);
      }

      const attemptedCount = correctCount + wrongCount;
      const accuracy = attemptedCount
        ? Number(((correctCount / attemptedCount) * 100).toFixed(2))
        : 0;

      await tx
        .update(testAttempts)
        .set({
          attemptStatus: "submitted",
          submittedAt: submittedAt ? new Date(submittedAt) : new Date(),
          score: totalScore,
          correctCount,
          wrongCount,
          unattemptedCount,
          accuracy,
          updatedAt: new Date(),
        })
        .where(eq(testAttempts.id, attemptIdNumber));

      return {
        data: {
          success: true,
          attemptId: attemptIdNumber,
          totalScore,
          correctCount,
          wrongCount,
          unattemptedCount,
          accuracy,
        },
        status: 200,
      };
    });

    if ("error" in result) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }

    return NextResponse.json(result.data, { status: result.status });
  } catch (error) {
    console.error("Error submitting attempt:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}