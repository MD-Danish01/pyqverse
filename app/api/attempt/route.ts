import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { eq, inArray } from "drizzle-orm";
import { questions } from "@/db/schema";
import { questionOptions } from "@/db/schema";

export async function POST(request: NextRequest) {
   try {
     const { examId, userId } = await request.json();
     console.log("Received examId:", examId, "and userId:", userId);
   if (!examId || !userId) {
         return NextResponse.json({ error: "Missing examId or userId" }, { status: 400 });
     }
   const examIdNumber = Number(examId);
   if (Number.isNaN(examIdNumber)) {
     return NextResponse.json({ error: "Invalid examId" }, { status: 400 });
   }
     //fetch questions for the exam from questions table using examId
   const examQuestions = await db
     .select()
     .from(questions)
     .where(eq(questions.examId, examIdNumber))
     .orderBy(questions.id);
     if (examQuestions.length === 0) {
         return NextResponse.json({ error: "No questions found for the given examId" }, { status: 404 });
     }
 
   const questionIds = examQuestions.map((question) => question.id);
   const options = await db
     .select()
     .from(questionOptions)
     .where(inArray(questionOptions.questionId, questionIds));

   const optionsByQuestionId: Record<number, typeof options> = {};
   for (const option of options) {
     const key = Number(option.questionId);
     if (!optionsByQuestionId[key]) {
       optionsByQuestionId[key] = [];
     }
     optionsByQuestionId[key].push(option);
   }

   const attemptQuestions = examQuestions.map((question, index) => ({
     order: index + 1,
     question,
     options: optionsByQuestionId[question.id] ?? [],
   }));

   return NextResponse.json({ questions: attemptQuestions }, { status: 200 });
   } catch (error) {
     console.error("Error fetching questions:", error);
     return NextResponse.json({ error: "Internal server error" }, { status: 500 });
   }
}