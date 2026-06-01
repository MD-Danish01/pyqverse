import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { and, eq, inArray } from "drizzle-orm";
import {
  exams,
  questionOptions,
  questions,
  subjects,
  testAttempts,
  testQuestions,
} from "@/db/schema";

export async function POST(request: NextRequest) {
   try {
     const { examId, userId } = await request.json();
     console.log("Received examId:", examId, "and userId:", userId);
   if (!examId || !userId) {
         return NextResponse.json({ error: "Missing examId or userId" }, { status: 400 });
     }
   const examIdNumber = Number(examId);
   const userIdNumber = Number(userId);
   if (Number.isNaN(examIdNumber)) {
     return NextResponse.json({ error: "Invalid examId" }, { status: 400 });
   }
   if (Number.isNaN(userIdNumber)) {
     return NextResponse.json({ error: "Invalid userId" }, { status: 400 });
   }
     //fetch questions for the exam from questions table using examId
   const payload = await db.transaction(async (tx) => {
     const [exam] = await tx
       .select({
         id: exams.id,
         marks: exams.marks,
         durationSeconds: exams.durationSeconds,
       })
       .from(exams)
       .where(eq(exams.id, examIdNumber));

     if (!exam) {
       return {
         error: "Exam not found",
         status: 404,
       };
     }

     await tx
       .update(testAttempts)
       .set({ attemptStatus: "abandoned", updatedAt: new Date() })
       .where(
         and(
           eq(testAttempts.userId, userIdNumber),
           eq(testAttempts.examId, examIdNumber),
           eq(testAttempts.attemptStatus, "in_progress"),
         ),
       );

     const examQuestions = await tx
       .select({
         question: questions,
         subjectName: subjects.name,
       })
       .from(questions)
       .leftJoin(subjects, eq(questions.subjectId, subjects.id))
       .where(eq(questions.examId, examIdNumber))
       .orderBy(questions.id);

     if (examQuestions.length === 0) {
       return {
         error: "No questions found for the given examId",
         status: 404,
       };
     }

     const totalMarksFromQuestions = examQuestions.reduce(
       (sum, entry) => sum + entry.question.marks,
       0,
     );

     if (totalMarksFromQuestions !== exam.marks) {
       return {
         error: "Exam marks do not match the question marks total",
         status: 409,
         examMarks: exam.marks,
         questionMarks: totalMarksFromQuestions,
       };
     }

     const [attempt] = await tx
       .insert(testAttempts)
       .values({
         userId: userIdNumber,
         examId: examIdNumber,
         startedAt: new Date(),
         durationSeconds: exam.durationSeconds,
         totalQuestions: examQuestions.length,
         totalMarks: exam.marks,
       })
       .returning({ id: testAttempts.id });

     if (!attempt) {
       return {
         error: "Failed to create test attempt",
         status: 500,
       };
     }

     await tx.insert(testQuestions).values(
       examQuestions.map((entry, index) => ({
         attemptId: attempt.id,
         questionId: entry.question.id,
         subjectId: entry.question.subjectId,
         questionOrder: index + 1,
       })),
     );

     const questionIds = examQuestions.map((entry) => entry.question.id);
     const options = await tx
       .select({
         id: questionOptions.id,
         questionId: questionOptions.questionId,
         label: questionOptions.label,
         optionText: questionOptions.optionText,
         optionImageUrl: questionOptions.optionImageUrl,
       })
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

     const attemptQuestions = examQuestions.map((entry, index) => {
       console.log(
         "Subject from DB:",
         entry.subjectName,
         "Question ID:",
         entry.question.id,
       );
       return {
         order: index + 1,
         question: {
           id: entry.question.id,
           questionText: entry.question.questionText,
           questionImageUrl: entry.question.questionImageUrl,
           questionType: entry.question.questionType,
           difficulty: entry.question.difficulty,
           subjectName: entry.subjectName ?? null,
         },
         options: optionsByQuestionId[entry.question.id] ?? [],
       };
     });

     return {
       data: {
         attemptId: attempt.id,
         questions: attemptQuestions,
       },
       status: 200,
     };
   });

   if ("error" in payload) {
     return NextResponse.json(
       {
         error: payload.error,
         examMarks: payload.examMarks,
         questionMarks: payload.questionMarks,
       },
       { status: payload.status },
     );
   }

   return NextResponse.json(payload.data, { status: payload.status });
   } catch (error) {
     console.error("Error fetching questions:", error);
     return NextResponse.json({ error: "Internal server error" }, { status: 500 });
   }
}
