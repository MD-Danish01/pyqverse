/**
 * JEE Practice – Home Page
 *
 * Stack  : Next.js App Router · TypeScript · Tailwind CSS
 * Fonts  : Add to your layout.tsx for best results:
 *            import { IBM_Plex_Serif } from "next/font/google";
 *            import { DM_Sans } from "next/font/google";
 *          Then pass their .variable to <body> and configure
 *          tailwind.config.ts with fontFamily: { display: ["var(--font-display)"], sans: ["var(--font-sans)"] }
 * Deps   : lucide-react  →  npm install lucide-react
 */

import type { Metadata } from "next";
import Link from "next/link";
import {
  BookOpen,
  BarChart2,
  ClipboardCheck,
  PieChart,
  FileText,
  Monitor,
  CheckCircle2,
  ArrowRight,
  ChevronRight,
  type LucideIcon,
} from "lucide-react";
import Footer from "@/components/footer";

// ─── Metadata ────────────────────────────────────────────────────────────────

export const metadata: Metadata = {
  title: "JEE Main Mock Tests & PYQ Practice Platform",
  description:
    "Practice JEE Main previous year questions, take mock tests, analyze performance, and improve exam readiness with detailed solutions and subject-wise insights.",
  keywords: [
    "JEE Main Mock Test",
    "JEE Main PYQ Practice",
    "JEE Main Previous Year Questions",
    "Online JEE Main Practice Test",
    "JEE Main Question Bank",
  ],
  openGraph: {
    title: "JEE Main Mock Tests & PYQ Practice Platform",
    description:
      "Practice JEE Main previous year questions, take mock tests, analyze performance, and improve exam readiness with detailed solutions and subject-wise insights.",
    type: "website",
  },
};

// ─── Data ────────────────────────────────────────────────────────────────────

interface Feature {
  icon: LucideIcon;
  title: string;
  description: string;
}

const features: Feature[] = [
  {
    icon: BookOpen,
    title: "Previous Year Questions",
    description:
      "Access JEE Main PYQs organised by year, subject, and topic for targeted, high-impact revision.",
  },
  {
    icon: Monitor,
    title: "Mock Test Experience",
    description:
      "Attempt full-length mock tests in an interface that mirrors the NTA JEE Main CBT environment.",
  },
  {
    icon: BarChart2,
    title: "Detailed Result Analysis",
    description:
      "Get instant analysis of your performance across accuracy, time management, and question difficulty.",
  },
  {
    icon: PieChart,
    title: "Subject-wise Performance",
    description:
      "Understand your strengths and gaps across Physics, Chemistry, and Mathematics with clear breakdowns.",
  },
  {
    icon: FileText,
    title: "Question-wise Solution Review",
    description:
      "Study step-by-step solutions for every question to understand the correct approach and fix gaps.",
  },
  {
    icon: ClipboardCheck,
    title: "Real Exam Interface",
    description:
      "Practice with accurate marking schemes, question navigation, and time limits identical to JEE Main.",
  },
];

interface Exam {
  name: string;
  description: string;
  available: boolean;
  tag: string;
}

const exams: Exam[] = [
  {
    name: "JEE Main",
    description: "Engineering entrance examination conducted by NTA",
    available: true,
    tag: "Available Now",
  },
  {
    name: "NEET",
    description: "National medical entrance examination",
    available: false,
    tag: "Coming Soon",
  },
  {
    name: "CUET",
    description: "Common University Entrance Test",
    available: false,
    tag: "Coming Soon",
  },
  {
    name: "GATE",
    description: "Graduate Aptitude Test in Engineering",
    available: false,
    tag: "Coming Soon",
  },
];

interface Step {
  number: string;
  title: string;
  description: string;
}

const steps: Step[] = [
  {
    number: "01",
    title: "Select a Test",
    description: "Choose a mock test or PYQ set from the test library.",
  },
  {
    number: "02",
    title: "Attempt Questions",
    description: "Solve questions in a timed, exam-like environment.",
  },
  {
    number: "03",
    title: "Submit Test",
    description: "Review flagged questions and submit before time ends.",
  },
  {
    number: "04",
    title: "Analyze Results",
    description: "Get instant scores, accuracy metrics, and a full breakdown.",
  },
  {
    number: "05",
    title: "Learn from Solutions",
    description: "Review detailed solutions and reinforce your understanding.",
  },
];

const benefits: string[] = [
  "Exam-like environment that accurately simulates the NTA CBT interface",
  "Instant performance feedback after every test attempt",
  "Subject-wise and topic-wise analysis for targeted improvement",
  "Solution-based learning with clear, step-by-step explanations",
  "Practice at your own pace with no external pressure",
];

// ─── Shared Styles ────────────────────────────────────────────────────────────

const CONTAINER = "mx-auto max-w-6xl px-4 sm:px-6 lg:px-8";
const SECTION_PAD = "py-20 sm:py-24";
const HEADING_2 =
  "text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight";
const SUBTEXT = "mt-2 text-slate-600 text-base";

// ─── Sub-components ───────────────────────────────────────────────────────────

function LogoMark({ size = "md" }: { size?: "sm" | "md" }) {
  const dim = size === "sm" ? "h-6 w-6" : "h-7 w-7";
  const txt = size === "sm" ? "text-[10px]" : "text-xs";
  return (
    <div
      className={`${dim} rounded bg-amber-600 flex items-center justify-center flex-shrink-0`}
      aria-hidden="true"
    >
      <span className={`text-white font-bold ${txt} leading-none`}>PV</span>
    </div>
  );
}

export default function Home() {
  return (
    <>
      <header className="sticky top-0 z-50 bg-white border-b border-slate-200">
        <div className={CONTAINER}>
          <div className="flex h-14 items-center justify-between">
            <div className="flex items-center gap-2.5">
              <LogoMark size="md" />
              <span className="font-semibold text-slate-900 text-sm tracking-tight">
                PyqVerse
              </span>
            </div>
            <nav aria-label="Main navigation" className="hidden md:flex items-center gap-6">
              <Link
                href="/tests-list"
                className="text-sm text-slate-600 hover:text-slate-900 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 rounded"
              >
                Mock Tests
              </Link>
              <Link
                href="/tests-list"
                className="text-sm text-slate-600 hover:text-slate-900 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 rounded"
              >
                PYQ Practice
              </Link>
            </nav>
            <Link
              href="/tests-list"
              className="bg-amber-600 hover:bg-amber-700 text-white text-sm font-medium px-4 py-2 rounded transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2"
            >
              Start Practicing
            </Link>
          </div>
        </div>
      </header>

      <main>
        <section
          aria-labelledby="hero-heading"
          className="bg-white py-20 sm:py-28 border-b border-slate-100"
        >
          <div className={`${CONTAINER} max-w-3xl text-center`}>
            <p className="inline-flex items-center gap-2 text-xs font-semibold tracking-widest text-amber-600 uppercase mb-6">
              <span
                className="inline-block h-px w-5 bg-amber-400"
                aria-hidden="true"
              />
              JEE Main Preparation Platform
              <span
                className="inline-block h-px w-5 bg-amber-400"
                aria-hidden="true"
              />
            </p>

            <h1
              id="hero-heading"
              className="text-4xl sm:text-5xl lg:text-[3.5rem] font-bold text-slate-900 leading-[1.1] tracking-tight mb-5"
            >
              JEE Main Mock Tests
              <br />
              &amp;&nbsp;PYQ Practice
            </h1>

            <p className="text-base sm:text-lg text-slate-600 leading-relaxed mb-10 max-w-xl mx-auto">
              Practice previous year questions, take realistic mock tests,
              analyse your performance, and build genuine exam readiness.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/tests-list"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-amber-600 hover:bg-amber-700 text-white font-semibold px-7 py-3 rounded transition-colors text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2"
              >
                Start Practicing
                <ArrowRight size={15} aria-hidden="true" />
              </Link>
              <Link
                href="/tests-list"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 border border-slate-300 hover:border-slate-400 hover:bg-slate-50 text-slate-700 font-semibold px-7 py-3 rounded transition-colors text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2"
              >
                Browse Tests
                <ChevronRight size={15} aria-hidden="true" />
              </Link>
            </div>
            <div className="mt-14 pt-10 border-t border-slate-100 flex flex-wrap items-center justify-center gap-x-8 gap-y-4">
              {[
                { value: "Physics · Chemistry · Maths", label: "All 3 subjects covered" },
                { value: "PYQ + Mock Tests", label: "Two modes of practice" },
                { value: "Instant Analysis", label: "After every attempt" },
              ].map((item) => (
                <div key={item.label} className="text-center">
                  <div className="text-sm font-semibold text-slate-800">
                    {item.value}
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5">
                    {item.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
        <section
          aria-labelledby="features-heading"
          className={`${SECTION_PAD} bg-slate-50`}
        >
          <div className={CONTAINER}>
            <header className="mb-12">
              <h2 id="features-heading" className={HEADING_2}>
                Why Practice Here?
              </h2>
              <p className={SUBTEXT}>
                Every feature is built around the structure and demands of JEE
                Main.
              </p>
            </header>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {features.map((feature) => {
                const Icon = feature.icon;
                return (
                  <article
                    key={feature.title}
                    className="bg-white border border-slate-200 rounded-lg p-6 hover:border-amber-200 transition-colors group"
                  >
                    <div
                      className="w-9 h-9 rounded bg-amber-50 border border-amber-100 flex items-center justify-center mb-4 flex-shrink-0 group-hover:bg-amber-100 transition-colors"
                      aria-hidden="true"
                    >
                      <Icon size={18} className="text-amber-600" />
                    </div>
                    <h3 className="font-semibold text-slate-900 mb-2 text-sm sm:text-base">
                      {feature.title}
                    </h3>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      {feature.description}
                    </p>
                  </article>
                );
              })}
            </div>
          </div>
        </section>
        <section
          aria-labelledby="exams-heading"
          className={`${SECTION_PAD} bg-white border-t border-slate-100`}
        >
          <div className={CONTAINER}>
            <header className="mb-12">
              <h2 id="exams-heading" className={HEADING_2}>
                Available Exams
              </h2>
              <p className={SUBTEXT}>
                JEE Main is live. More exams are in development.
              </p>
            </header>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {exams.map((exam) => (
                <div
                  key={exam.name}
                  className={`border rounded-lg p-6 transition-colors ${
                    exam.available
                      ? "border-amber-200 bg-amber-50"
                      : "border-slate-200 bg-white"
                  }`}
                >
                  <div className="flex items-start justify-between mb-2 gap-2">
                    <h3
                      className={`font-semibold text-base leading-tight ${
                        exam.available ? "text-slate-900" : "text-slate-400"
                      }`}
                    >
                      {exam.name}
                    </h3>
                    <span
                      className={`text-xs font-medium px-2 py-0.5 rounded-full leading-none whitespace-nowrap flex-shrink-0 ${
                        exam.available
                          ? "bg-amber-600 text-white"
                          : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {exam.tag}
                    </span>
                  </div>

                  <p
                    className={`text-sm mb-5 leading-relaxed ${
                      exam.available ? "text-slate-600" : "text-slate-400"
                    }`}
                  >
                    {exam.description}
                  </p>

                  {exam.available ? (
                    <Link
                      href="/tests-list"
                      className="inline-flex items-center gap-1 text-sm font-medium text-amber-600 hover:text-amber-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 rounded"
                    >
                      Practice Now
                      <ChevronRight size={14} aria-hidden="true" />
                    </Link>
                  ) : (
                    <span className="text-xs text-slate-400">
                      Notify when available
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
        <section
          aria-labelledby="how-it-works-heading"
          className={`${SECTION_PAD} bg-slate-50 border-t border-slate-100`}
        >
          <div className={CONTAINER}>
            <header className="mb-14">
              <h2 id="how-it-works-heading" className={HEADING_2}>
                How It Works
              </h2>
              <p className={SUBTEXT}>
                From test selection to performance insight in five steps.
              </p>
            </header>
            <div className="hidden md:block relative" aria-hidden="false">
              <div
                className="absolute top-5 h-px bg-slate-200"
                style={{ left: "calc(10% + 1.25rem)", right: "calc(10% + 1.25rem)" }}
                aria-hidden="true"
              />
              <ol
                aria-label="Platform steps"
                className="flex items-start"
              >
                {steps.map((step) => (
                  <li
                    key={step.number}
                    className="flex-1 flex flex-col items-center text-center px-3 relative"
                  >
                    <div className="w-10 h-10 rounded-full border-2 border-amber-600 bg-white flex items-center justify-center mb-4 relative z-10">
                      <span className="text-amber-600 font-bold text-xs font-mono tracking-tight">
                        {step.number}
                      </span>
                    </div>
                    <h3 className="font-semibold text-slate-900 text-sm mb-1.5">
                      {step.title}
                    </h3>
                    <p className="text-xs text-slate-500 leading-relaxed max-w-[140px]">
                      {step.description}
                    </p>
                  </li>
                ))}
              </ol>
            </div>
            <ol
              aria-label="Platform steps"
              className="md:hidden flex flex-col"
            >
              {steps.map((step, index) => (
                <li key={step.number} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-10 h-10 rounded-full border-2 border-amber-600 bg-white flex items-center justify-center flex-shrink-0 z-10">
                      <span className="text-amber-600 font-bold text-xs font-mono tracking-tight">
                        {step.number}
                      </span>
                    </div>
                    {index < steps.length - 1 && (
                      <div
                        className="w-px flex-1 bg-slate-200 my-1"
                        aria-hidden="true"
                      />
                    )}
                  </div>
                  <div className="pb-8 pt-2">
                    <h3 className="font-semibold text-slate-900 mb-1">
                      {step.title}
                    </h3>
                    <p className="text-sm text-slate-500 leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>
        <section
          aria-labelledby="benefits-heading"
          className={`${SECTION_PAD} bg-white border-t border-slate-100`}
        >
          <div className={CONTAINER}>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-start">
              <div>
                <h2 id="benefits-heading" className={`${HEADING_2} mb-4`}>
                  Designed for Effective Practice
                </h2>
                <p className="text-slate-600 text-base leading-relaxed mb-6">
                  Every element of this platform reflects the structure and
                  demands of JEE Main — from the interface to the marking
                  scheme to the performance reports.
                </p>
                <Link
                  href="/tests-list"
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-amber-600 hover:text-amber-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 rounded"
                >
                  Start a practice test
                  <ChevronRight size={14} aria-hidden="true" />
                </Link>
              </div>
              <ul className="flex flex-col gap-4">
                {benefits.map((benefit) => (
                  <li key={benefit} className="flex items-start gap-3">
                    <CheckCircle2
                      size={17}
                      className="text-amber-600 mt-0.5 flex-shrink-0"
                      aria-hidden="true"
                    />
                    <span className="text-sm sm:text-base text-slate-700 leading-relaxed">
                      {benefit}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>
        <section
          aria-labelledby="cta-heading"
          className={`${SECTION_PAD} bg-slate-900`}
        >
          <div className={`${CONTAINER} max-w-2xl text-center`}>
            <div
              className="flex items-center justify-center gap-3 mb-8"
              aria-hidden="true"
            >
              <span className="h-px w-12 bg-slate-700" />
              <span className="text-slate-600 text-xs font-mono tracking-widest uppercase">
                Get Started
              </span>
              <span className="h-px w-12 bg-slate-700" />
            </div>

            <h2
              id="cta-heading"
              className="text-2xl sm:text-3xl font-bold text-white tracking-tight mb-4"
            >
              Ready to Start Practicing?
            </h2>
            <p className="text-slate-400 mb-9 text-base leading-relaxed max-w-md mx-auto">
              Begin solving questions and improve your exam performance today.
            </p>
            <Link
              href="/tests-list"
              className="inline-flex items-center gap-2 bg-amber-600 hover:bg-amber-500 text-white font-semibold px-8 py-3.5 rounded transition-colors text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
            >
              View Mock Tests
              <ArrowRight size={16} aria-hidden="true" />
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
