//create userID in database and return it
import { NextResponse } from "next/server";
import db from "@/lib/db";
import { users } from "@/db/schema";

export async function GET() {
    const newUser = await db.insert(users).values({}).returning();
    console.log(newUser);
    return NextResponse.json({ id: newUser[0].id }, { status: 201 });
}