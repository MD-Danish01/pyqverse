import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { questionOptions, questions } from "@/db/schema";
import { eq, inArray } from "drizzle-orm";
export async function POST(request: NextRequest) {
  const { examId, studentResponses } = await request.json();

  console.log("Received examId:", examId);
  console.log("Received studentResponses:", studentResponses);

  const examIdNumber = Number(examId);
  if (!examId || Number.isNaN(examIdNumber)) {
    return NextResponse.json({ error: "Invalid examId" }, { status: 400 });
  }

  if (!Array.isArray(studentResponses)) {
    return NextResponse.json({ error: "Invalid responses" }, { status: 400 });
  }

  try {
    // Fetch all questions with options to verify answers
    const examQuestions = await db
      .select()
      .from(questions)
      .where(eq(questions.examId, examIdNumber));

    const questionIds = examQuestions.map((question) => question.id);
    const allOptions = await db
      .select()
      .from(questionOptions)
      .where(inArray(questionOptions.questionId, questionIds));

    // Create a map for quick lookup
    const optionsMap: Record<number, typeof allOptions[0]> = {};
    allOptions.forEach((opt) => {
      optionsMap[opt.id] = opt;
    });

    let totalScore = 0;
    let correctCount = 0;
    let attemptedCount = 0;

    // Grade each response
    const gradedResponses = studentResponses.map((response: { questionId: number; selectedOptionId: number | null; isMarkedForReview: boolean }) => {
      const question = examQuestions.find((q) => q.id === response.questionId);
      if (!question) return null;

      attemptedCount++;
      let isCorrect = false;
      let scoreObtained = 0;

      if (response.selectedOptionId) {
        const selectedOption = optionsMap[response.selectedOptionId];
        isCorrect = selectedOption?.isCorrect ?? false;

        if (isCorrect) {
          scoreObtained = question.marks;
          correctCount++;
        } else {
          scoreObtained = question.negativeMarks;
        }
        totalScore += scoreObtained;
      }

      return {
        questionId: response.questionId,
        selectedOptionId: response.selectedOptionId,
        isCorrect,
        scoreObtained,
        markedForReview: response.isMarkedForReview,
      };
    });

    console.log({
      success: true,
      totalScore,
      correctCount,
      attemptedCount,
      accuracy: attemptedCount
        ? ((correctCount / attemptedCount) * 100).toFixed(2) + "%"
        : "0.00%",
      gradedResponses: gradedResponses.filter(Boolean),
    });
    

    return NextResponse.json({
      success: true,
      totalScore,
      correctCount,
      attemptedCount,
      accuracy: attemptedCount
        ? ((correctCount / attemptedCount) * 100).toFixed(2) + "%"
        : "0.00%",
      gradedResponses: gradedResponses.filter(Boolean),
    });
  } catch (error) {
    console.error("Error submitting attempt:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}