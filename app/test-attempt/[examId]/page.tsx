"use client";
import { useParams } from "next/navigation";
import { useEffect } from "react";

const AttemptTest = () => {
  const params = useParams();
  const examId = params.examId;
  console.log("Exam ID from URL:", examId);

  //fetch questions for the exam from database using examId
  useEffect(() => {
    //get userId from local storage
    const userId: number | null = JSON.parse(localStorage.getItem("userId") ?? "null");

    console.log("User ID from local storage:", userId);

    const fetchQuestions = async () => {
      try {
        const res = await fetch("/api/attempt", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ examId, userId }),
        });
        const data = await res.json();
        console.log("Fetched questions:", data);
      } catch (error) {
        console.error("Error fetching questions:", error);
      }
    };

    fetchQuestions();
  }, [examId]);

  return (
    <>
      <h1>Attempt Test</h1>
    </>
  );
};

export default AttemptTest;
