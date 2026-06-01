// "use client";
// import * as React from "react";
// import Link from "next/link";
// import { useParams } from "next/navigation";

// const GeneralInstructions = () => {
//   //get exam id from url
//     const params = useParams();

//   return (
//     <>
//       <h1 className="mx-auto">General Instructions</h1>
//       <Link href={`/test-attempt/${params.examId}`}>
//         <button className="bg-blue-500 text-white p-2 rounded">
//           Start Test
//         </button>
//       </Link>
//     </>
//   );
// };

// export default GeneralInstructions;


"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";

export default function GeneralInstructionsPage() {
  const params = useParams();
  const [accepted, setAccepted] = useState(false);

  return (
    <main className="min-h-screen bg-white text-slate-900">
      <div className="mx-auto max-w-5xl px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">
            General Instructions
          </h1>

          <p className="mt-2 text-muted-foreground">
            Please read the instructions carefully before starting the test.
          </p>
        </div>

        {/* Test Information */}
        <section className="mb-6 rounded-lg border bg-card p-6">
          <h2 className="mb-4 text-xl font-semibold">Test Information</h2>

          <div className="space-y-2">
            <p>
              <span className="font-medium">Exam:</span> JEE Main Mock Test
            </p>

            <p>
              <span className="font-medium">Duration:</span> 180 Minutes
            </p>

            <p>
              <span className="font-medium">Subjects:</span> Physics,
              Chemistry, Mathematics
            </p>

            <p>
              <span className="font-medium">Maximum Marks:</span> 300
            </p>
          </div>
        </section>

        {/* Marking Scheme */}
        <section className="mb-6 rounded-lg border bg-card p-6">
          <h2 className="mb-4 text-xl font-semibold">Marking Scheme</h2>

          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <span className="text-green-600 font-bold">✓</span>
              <span>Correct Answer: +4 marks</span>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-red-600 font-bold">✗</span>
              <span>Incorrect Answer: -1 mark</span>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-gray-500 font-bold">—</span>
              <span>Unattempted Question: 0 marks</span>
            </div>
          </div>
        </section>

        {/* Question Palette Guide */}
        <section className="mb-6 rounded-lg border bg-card p-6">
          <h2 className="mb-4 text-xl font-semibold">
            Understanding the Question Palette
          </h2>

          <p className="mb-4 text-muted-foreground">
            The question palette helps you track your progress and navigate
            between questions during the test.
          </p>

          {/* Replace image path */}
          <div className="mb-6 overflow-hidden rounded-lg border">
            <Image
              src="/instructions/question-palette.png"
              alt="Question palette example"
              width={1200}
              height={600}
              className="w-full h-auto"
            />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="py-3 text-left">Status</th>
                  <th className="py-3 text-left">Meaning</th>
                </tr>
              </thead>

              <tbody>
                <tr className="border-b">
                  <td className="py-3">Not Visited</td>
                  <td className="py-3">
                    You have not opened this question yet.
                  </td>
                </tr>

                <tr className="border-b">
                  <td className="py-3">Not Answered</td>
                  <td className="py-3">
                    You visited the question but did not save an answer.
                  </td>
                </tr>

                <tr className="border-b">
                  <td className="py-3">Answered</td>
                  <td className="py-3">
                    You selected an answer and saved it.
                  </td>
                </tr>

                <tr className="border-b">
                  <td className="py-3">Marked for Review</td>
                  <td className="py-3">
                    The question is marked for later review.
                  </td>
                </tr>

                <tr>
                  <td className="py-3">Answered & Marked for Review</td>
                  <td className="py-3">
                    Your answer will be evaluated and the question remains
                    marked for review.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Navigation Guide */}
        <section className="mb-6 rounded-lg border bg-card p-6">
          <h2 className="mb-4 text-xl font-semibold">Navigation Guide</h2>

          {/* Replace image path */}
          <div className="mb-6 overflow-hidden rounded-lg border">
            <Image
              src="/instructions/navigation-guide.png"
              alt="Navigation guide"
              width={1200}
              height={600}
              className="w-full h-auto"
            />
          </div>

          <ul className="space-y-3 list-disc pl-5">
            <li>
              Click any question number in the palette to jump directly to that
              question.
            </li>

            <li>
              <strong>Save & Next</strong> saves your answer and moves to the
              next question.
            </li>

            <li>
              <strong>Mark for Review & Next</strong> saves your answer and
              marks the question for later review.
            </li>

            <li>
              <strong>Clear Response</strong> removes the selected answer.
            </li>

            <li>
              You may navigate freely between questions throughout the test.
            </li>
          </ul>
        </section>

        {/* Answering Questions */}
        <section className="mb-6 rounded-lg border bg-card p-6">
          <h2 className="mb-4 text-xl font-semibold">
            Answering Questions
          </h2>

          <ol className="space-y-3 list-decimal pl-5">
            <li>Select the option you believe is correct.</li>

            <li>
              Click <strong>Save & Next</strong> to save your answer.
            </li>

            <li>
              You can change your answer anytime before submitting the test.
            </li>

            <li>
              Responses that are not saved will not be considered during
              evaluation.
            </li>

            <li>
              Use <strong>Mark for Review</strong> for questions you wish to
              revisit later.
            </li>
          </ol>
        </section>

        {/* Submission */}
        <section className="mb-6 rounded-lg border bg-card p-6">
          <h2 className="mb-4 text-xl font-semibold">Test Submission</h2>

          <ul className="space-y-3 list-disc pl-5">
            <li>You may submit the test before the timer ends.</li>

            <li>
              When the timer reaches zero, the test will be submitted
              automatically.
            </li>

            <li>
              Once submitted, answers cannot be modified or resubmitted.
            </li>
          </ul>
        </section>

        {/* Results */}
        <section className="mb-6 rounded-lg border bg-card p-6">
          <h2 className="mb-4 text-xl font-semibold">
            Results & Solutions
          </h2>

          <p className="mb-4">
            After submitting the test, you will receive a detailed performance
            report.
          </p>

          <ul className="space-y-3 list-disc pl-5">
            <li>Total Score</li>
            <li>Subject-wise Performance Analysis</li>
            <li>Correct & Incorrect Answers</li>
            <li>Question-wise Review</li>
            <li>Detailed Solutions and Explanations</li>
          </ul>
        </section>

        {/* Declaration */}
        <section className="rounded-lg border bg-card p-6">
          <h2 className="mb-4 text-xl font-semibold">Declaration</h2>

          <label className="flex items-start gap-3">
            <input
              type="checkbox"
              checked={accepted}
              onChange={(e) => setAccepted(e.target.checked)}
              className="mt-1"
            />

            <span>
              I have read and understood the instructions, marking scheme,
              navigation controls, and submission process. I am ready to begin
              the test.
            </span>
          </label>

          <div className="mt-6">
            <Link href={`/test-attempt/${params.examId}`}>
              <button
                disabled={!accepted}
                className="bg-amber-600 hover:bg-amber-700 text-white text-sm font-medium px-4 py-2 rounded transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2"
              >
                Start Test
              </button>
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
