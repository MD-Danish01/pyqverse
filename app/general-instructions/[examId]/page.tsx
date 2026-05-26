"use client";
import * as React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

const GeneralInstructions = () => {
  //get exam id from url
    const params = useParams();

  return (
    <>
      <h1 className="mx-auto">General Instructions</h1>
      <Link href={`/test-attempt/${params.examId}`}>
        <button className="bg-blue-500 text-white p-2 rounded">
          Start Test
        </button>
      </Link>
    </>
  );
};

export default GeneralInstructions;
