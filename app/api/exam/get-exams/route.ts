import { NextResponse } from "next/server";
import db from "@/lib/db";
import { exams } from "@/db/schema";

export async function GET() {
    const allExams = await db.select().from(exams);
    console.log(allExams);
    return NextResponse.json(allExams, { status: 200 });
}