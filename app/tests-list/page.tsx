// "use client";

// import { useEffect, useState } from "react";
// import Link from "next/link";

// export default function TestsList() {
//   //get tests from database and display them in a list
//   type Test = {
//     id: number;
//     name: string;
//     durationSeconds: number;
//     totalQuestions: number;
//     marks: number;
//     examType: string;
//     isFree: boolean;
//   };
//   const [tests, setTests] = useState<Test[]>([]);

//   useEffect(() => {
//     const dgetAllTests = async () => {
//       const res = await fetch("/api/exam/get-exams");
//       const data = await res.json();
//       setTests(data);
//     };
//     dgetAllTests();
//   }, []);

//   /**
//    * [
//   {
//     id: 1,
//     name: 'JEE MAIN',
//     durationSeconds: 3600,
//     totalQuestions: 15,
//     marks: 90,
//     examType: 'previous_year',
//     isFree: true,
//     createdAt: 2026-05-25T10:33:24.654Z,
//     updatedAt: 2026-05-25T10:33:24.654Z
//   }
// ]
//    */
//   useEffect(() => {
//     const createuserId = async () => {
//       // create user id in database and store it in local storage if not already present
//       const res = await fetch("/api/user/create-user");

//       const data = await res.json();
//       console.log(`user id created : ${data.id}`);
//       if (!localStorage.getItem("userId")) {
//         localStorage.setItem("userId", JSON.stringify(data.id));
//       }
//     };
//     if (!localStorage.getItem("userId")){
//          createuserId();
//     }
//   }, []);

//   return (
//     <>
//       <h1 className="mx-auto">Tests List</h1>
//       <ul>
//         {tests.map((test) => (
//           <Link href={`/general-instructions/${test.id}`} key={test.id}>
//             <li className="border p-4 mb-4">
//               <h2 className="text-xl font-bold">{test.name}</h2>
//             </li>
//           </Link>
//         ))}
//       </ul>
//     </>
//   );
// }



"use client";

/**
 * /tests-list/page.tsx
 * Tests catalogue — production UI
 * Deps: lucide-react  →  npm install lucide-react
 */

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Clock,
  FileText,
  Target,
  ArrowRight,
  BookOpen,
  ChevronLeft,
} from "lucide-react";
import Footer from "@/components/footer";

// ─── Types ────────────────────────────────────────────────────────────────────

type Test = {
  id: number;
  name: string;
  durationSeconds: number;
  totalQuestions: number;
  marks: number;
  examType: string;
  isFree: boolean;
};

type FilterTab = "all" | "previous_year" | "mock";

// ─── Utilities ────────────────────────────────────────────────────────────────

/** 3600 → "60 min"  |  5400 → "1h 30m" */
function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  if (mins < 60) return `${mins} min`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m === 0 ? `${h}h` : `${h}h ${m}m`;
}

/** "previous_year" → "PYQ"  |  anything else → "Mock Test" */
function formatExamType(type: string): { label: string; isMock: boolean } {
  if (type === "previous_year") return { label: "PYQ", isMock: false };
  return { label: "Mock Test", isMock: true };
}

// ─── Skeleton ────────────────────────────────────────────────────────────────

function SkeletonCard() {
  return (
    <div className="bg-white border border-slate-200 rounded-lg p-6 animate-pulse">
      {/* Badges */}
      <div className="flex gap-2 mb-4">
        <div className="h-5 w-9 bg-slate-200 rounded-full" />
        <div className="h-5 w-9 bg-slate-200 rounded-full" />
      </div>
      {/* Title */}
      <div className="h-5 w-3/4 bg-slate-200 rounded mb-1.5" />
      <div className="h-4 w-1/2 bg-slate-100 rounded mb-5" />
      {/* Stats */}
      <div className="flex gap-3 mb-6">
        <div className="h-4 w-14 bg-slate-100 rounded" />
        <div className="h-4 w-18 bg-slate-100 rounded" />
        <div className="h-4 w-14 bg-slate-100 rounded" />
      </div>
      {/* Button */}
      <div className="h-9 w-full bg-slate-100 rounded" />
    </div>
  );
}

// ─── Empty State ──────────────────────────────────────────────────────────────

function EmptyState({ filter }: { filter: FilterTab }) {
  const labelMap: Record<FilterTab, string> = {
    all: "No tests available yet.",
    previous_year: "No previous year tests available yet.",
    mock: "No mock tests available yet.",
  };

  return (
    <div className="col-span-full flex flex-col items-center justify-center py-20 text-center">
      <div
        className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-4"
        aria-hidden="true"
      >
        <BookOpen size={20} className="text-slate-400" />
      </div>
      <h3 className="font-semibold text-slate-900 mb-1 text-sm">
        No tests found
      </h3>
      <p className="text-sm text-slate-500 max-w-xs">{labelMap[filter]}</p>
    </div>
  );
}

// ─── Test Card ────────────────────────────────────────────────────────────────

function TestCard({ test }: { test: Test }) {
  const { label: typeLabel, isMock } = formatExamType(test.examType);

  return (
    <article className="bg-white border border-slate-200 rounded-lg p-6 flex flex-col hover:border-amber-200 transition-colors group">
      {/* ── Badges ── */}
      <div className="flex items-center gap-2 mb-3">
        <span
          className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
            isMock
              ? "bg-slate-100 text-slate-600"
              : "bg-blue-50 text-blue-700"
          }`}
        >
          {typeLabel}
        </span>
        {test.isFree && (
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">
            Free
          </span>
        )}
      </div>

      {/* ── Title ── */}
      <h2 className="font-bold text-slate-900 text-base leading-snug mb-4 group-hover:text-amber-700 transition-colors">
        {test.name}
      </h2>

      {/* ── Stats row ── */}
      <dl className="flex items-center flex-wrap gap-x-4 gap-y-2 mb-6">
        <div className="flex items-center gap-1.5">
          <Clock size={13} className="text-slate-400 flex-shrink-0" aria-hidden="true" />
          <dt className="sr-only">Duration</dt>
          <dd className="text-sm text-slate-500">
            {formatDuration(test.durationSeconds)}
          </dd>
        </div>

        <div className="flex items-center gap-1.5">
          <FileText size={13} className="text-slate-400 flex-shrink-0" aria-hidden="true" />
          <dt className="sr-only">Questions</dt>
          <dd className="text-sm text-slate-500">{test.totalQuestions} Qs</dd>
        </div>

        <div className="flex items-center gap-1.5">
          <Target size={13} className="text-slate-400 flex-shrink-0" aria-hidden="true" />
          <dt className="sr-only">Total marks</dt>
          <dd className="text-sm text-slate-500">{test.marks} Marks</dd>
        </div>
      </dl>

      {/* ── CTA ── */}
      <div className="mt-auto">
        <Link
          href={`/general-instructions/${test.id}`}
          className="flex items-center justify-center gap-2 w-full bg-amber-600 hover:bg-amber-700 text-white text-sm font-semibold py-2.5 rounded transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2"
        >
          Start Test
          <ArrowRight size={14} aria-hidden="true" />
        </Link>
      </div>
    </article>
  );
}

// ─── Filter Tabs ──────────────────────────────────────────────────────────────

interface Tab {
  label: string;
  value: FilterTab;
}

const TABS: Tab[] = [
  { label: "All Tests", value: "all" },
  { label: "Previous Year", value: "previous_year" },
  { label: "Mock Tests", value: "mock" },
];

function getCount(tests: Test[], filter: FilterTab): number {
  if (filter === "all") return tests.length;
  if (filter === "previous_year")
    return tests.filter((t) => t.examType === "previous_year").length;
  return tests.filter((t) => t.examType !== "previous_year").length;
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function TestsList() {
  const [tests, setTests] = useState<Test[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<FilterTab>("all");

  // Fetch test catalogue
  useEffect(() => {
    const fetchTests = async () => {
      try {
        const res = await fetch("/api/exam/get-exams");
        const data: Test[] = await res.json();
        setTests(data);
      } catch (err) {
        console.error("Failed to fetch tests:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchTests();
  }, []);

  // Ensure anonymous user identity exists
  useEffect(() => {
    if (localStorage.getItem("userId")) return;
    const createUserId = async () => {
      try {
        const res = await fetch("/api/user/create-user");
        const data = await res.json();
        localStorage.setItem("userId", JSON.stringify(data.id));
      } catch (err) {
        console.error("Failed to create user:", err);
      }
    };
    createUserId();
  }, []);

  // Derived: filtered list based on active tab
  const filtered: Test[] =
    activeTab === "all"
      ? tests
      : activeTab === "previous_year"
      ? tests.filter((t) => t.examType === "previous_year")
      : tests.filter((t) => t.examType !== "previous_year");

  return (
    <>
      {/* ═══════════════════════════════════════════════════════════════════════
          SITE HEADER
      ═══════════════════════════════════════════════════════════════════════ */}
      <header className="sticky top-0 z-50 bg-white border-b border-slate-200">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-14 items-center justify-between">
            {/* Back to home */}
            <Link
              href="/"
              className="flex items-center gap-2.5 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 rounded"
              aria-label="Back to home"
            >
              <div
                className="h-7 w-7 rounded bg-amber-600 flex items-center justify-center flex-shrink-0"
                aria-hidden="true"
              >
                <span className="text-white font-bold text-xs leading-none">
                  PV
                </span>
              </div>
              <span className="font-semibold text-slate-900 text-sm tracking-tight">
                PyqVerse
              </span>
            </Link>

            {/* Breadcrumb hint */}
            <div
              className="hidden sm:flex items-center gap-1.5 text-xs text-slate-400"
              aria-hidden="true"
            >
              <ChevronLeft size={12} />
              <Link href="/" className="hover:text-slate-600 transition-colors">
                Home
              </Link>
              <span>/</span>
              <span className="text-slate-600 font-medium">Tests</span>
            </div>
          </div>
        </div>
      </header>

      {/* ═══════════════════════════════════════════════════════════════════════
          MAIN
      ═══════════════════════════════════════════════════════════════════════ */}
      <main className="bg-slate-50 min-h-screen">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-10 sm:py-12">

          {/* ── Page heading ── */}
          <div className="mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Available Tests
            </h1>
            <p className="mt-1.5 text-sm sm:text-base text-slate-600">
              Select a test to begin. Detailed results and solutions are
              available immediately after submission.
            </p>
          </div>

          {/* ── Filter tabs ── */}
          <div
            role="tablist"
            aria-label="Filter tests by type"
            className="flex items-center gap-1 p-1 bg-white border border-slate-200 rounded-lg w-fit mb-8"
          >
            {TABS.map((tab) => {
              const count = loading ? null : getCount(tests, tab.value);
              const isActive = activeTab === tab.value;
              return (
                <button
                  key={tab.value}
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => setActiveTab(tab.value)}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 text-sm font-medium rounded transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 ${
                    isActive
                      ? "bg-amber-600 text-white"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                  }`}
                >
                  {tab.label}
                  {/* Count badge — only when loaded */}
                  {count !== null && (
                    <span
                      className={`text-xs font-semibold px-1.5 py-0.5 rounded-full leading-none ${
                        isActive
                          ? "bg-amber-500 text-white"
                          : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* ── Card grid ── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {loading ? (
              /* Skeleton state */
              <>
                <SkeletonCard />
                <SkeletonCard />
                <SkeletonCard />
              </>
            ) : filtered.length === 0 ? (
              /* Empty state */
              <EmptyState filter={activeTab} />
            ) : (
              /* Cards */
              filtered.map((test) => <TestCard key={test.id} test={test} />)
            )}
          </div>
        </div>
      </main>

      {/* ═══════════════════════════════════════════════════════════════════════
          FOOTER
      ═══════════════════════════════════════════════════════════════════════ */}
      <Footer />
    </>
  );
}