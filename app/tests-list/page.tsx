"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function TestsList() {
  //get tests from database and display them in a list
  type Test = {
    id: number;
    name: string;
    durationSeconds: number;
    totalQuestions: number;
    marks: number;
    examType: string;
    isFree: boolean;
  };
  const [tests, setTests] = useState<Test[]>([]);

  useEffect(() => {
    const dgetAllTests = async () => {
      const res = await fetch("/api/exam/get-exams");
      const data = await res.json();
      setTests(data);
    };
    dgetAllTests();
  }, []);

  /**
   * [
  {
    id: 1,
    name: 'JEE MAIN',
    durationSeconds: 3600,
    totalQuestions: 15,
    marks: 90,
    examType: 'previous_year',
    isFree: true,
    createdAt: 2026-05-25T10:33:24.654Z,
    updatedAt: 2026-05-25T10:33:24.654Z
  }
]
   */
  useEffect(() => {
    const createuserId = async () => {
      // create user id in database and store it in local storage if not already present
      const res = await fetch("/api/user/create-user");

      const data = await res.json();
      console.log(`user id created : ${data.id}`);
      if (!localStorage.getItem("userId")) {
        localStorage.setItem("userId", JSON.stringify(data.id));
      }
    };
    if (!localStorage.getItem("userId")){
         createuserId();
    }
  }, []);

  return (
    <>
      <h1 className="mx-auto">Tests List</h1>
      <ul>
        {tests.map((test) => (
          <Link href={`/general-instructions/${test.id}`} key={test.id}>
            <li className="border p-4 mb-4">
              <h2 className="text-xl font-bold">{test.name}</h2>
            </li>
          </Link>
        ))}
      </ul>
    </>
  );
}
