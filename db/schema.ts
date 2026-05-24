import {
    pgTable,
    pgEnum,
    bigserial,
    bigint,
    varchar,
    text,
    integer,
    boolean,
    timestamp,
    date,
    numeric,
    index,
    uniqueIndex,
} from "drizzle-orm/pg-core";

/**
 * ENUMS
 */

export const examTypeEnum = pgEnum("exam_type", [
    "previous_year",
    "mock",
    "chapter_test",
    "subject_test",
]);

export const userRoleEnum = pgEnum("user_role", [
    "student",
    "admin",
]);

export const testTypeEnum = pgEnum("test_type", [
    "pyq_shift_test",
    "full_mock",
    "subject_test",
    "chapter_test",
    "custom_test",
]);

export const attemptStatusEnum = pgEnum("attempt_status", [
    "in_progress",
    "submitted",
    "abandoned",
    "expired",
]);

export const questionTypeEnum = pgEnum("question_type", [
    "single_correct",
    "numerical",
]);

export const difficultyEnum = pgEnum("difficulty", [
    "easy",
    "medium",
    "hard",
]);

/**
 * USERS
 */

export const users = pgTable("users", {
    id: bigserial("id", { mode: "number" }).primaryKey(),

    name: varchar("name", { length: 100 }).notNull(),

    email: varchar("email", { length: 150 }).notNull().unique(),

    image: text("image"),

    role: userRoleEnum("role").notNull().default("student"),

    createdAt: timestamp("created_at", { withTimezone: true })
        .notNull()
        .defaultNow(),

    updatedAt: timestamp("updated_at", { withTimezone: true })
        .notNull()
        .defaultNow(),
});

/**
 * EXAMS
 */

export const exams = pgTable("exams", {
    id: bigserial("id", { mode: "number" }).primaryKey(),

    name: varchar("name", { length: 200 }).notNull(),

    durationSeconds: integer("duration_seconds").notNull(),

    totalQuestions: integer("total_questions").notNull(),

    marks: integer("marks").notNull(),

    examType: examTypeEnum("exam_type").notNull().default("previous_year"),

    isFree: boolean("is_free").notNull().default(true),

    createdAt: timestamp("created_at", { withTimezone: true })
        .notNull()
        .defaultNow(),

    updatedAt: timestamp("updated_at", { withTimezone: true })
        .notNull()
        .defaultNow(),
});

/**
 * SUBJECTS
 */

export const subjects = pgTable(
    "subjects",
    {
        id: bigserial("id", { mode: "number" }).primaryKey(),

        examId: bigint("exam_id", { mode: "number" })
            .notNull()
            .references(() => exams.id, { onDelete: "cascade" }),

        name: varchar("name", { length: 100 }).notNull(),

        totalQuestions: integer("total_questions").notNull(),

        marks: numeric("marks", {
            precision: 8,
            scale: 2,
            mode: "number",
        }).notNull(),

        createdAt: timestamp("created_at", { withTimezone: true })
            .notNull()
            .defaultNow(),

        updatedAt: timestamp("updated_at", { withTimezone: true })
            .notNull()
            .defaultNow(),
    },
    (table) => [
        index("subjects_exam_id_idx").on(table.examId),
    ],
);

/**
 * CHAPTERS
 */

export const chapters = pgTable(
    "chapters",
    {
        id: bigserial("id", { mode: "number" }).primaryKey(),

        subjectId: bigint("subject_id", { mode: "number" })
            .notNull()
            .references(() => subjects.id, { onDelete: "cascade" }),

        name: text("name").notNull(),

        createdAt: timestamp("created_at", { withTimezone: true })
            .notNull()
            .defaultNow(),

        updatedAt: timestamp("updated_at", { withTimezone: true })
            .notNull()
            .defaultNow(),
    },
    (table) => [
        index("chapters_subject_id_idx").on(table.subjectId),
    ],
);

/**
 * QUESTIONS
 */

export const questions = pgTable(
    "questions",
    {
        id: bigserial("id", { mode: "number" }).primaryKey(),

        examId: bigint("exam_id", { mode: "number" })
            .notNull()
            .references(() => exams.id, { onDelete: "cascade" }),

        subjectId: bigint("subject_id", { mode: "number" })
            .notNull()
            .references(() => subjects.id, { onDelete: "restrict" }),

        chapterId: bigint("chapter_id", { mode: "number" })
            .references(() => chapters.id, { onDelete: "set null" }),

        questionText: text("question_text"),

        questionImageUrl: text("question_image_url"),

        solutionText: text("solution_text"),

        solutionImageUrl: text("solution_image_url"),

        questionType: questionTypeEnum("question_type").notNull(),

        correctAnswerText: text("correct_answer_text"),

        year: integer("year"),

        paperDate: date("paper_date"),

        session: text("session"),

        shift: text("shift"),

        difficulty: difficultyEnum("difficulty"),

        marks: integer("marks").notNull().default(4),

        negativeMarks: integer("negative_marks").notNull().default(-1),

        createdAt: timestamp("created_at", { withTimezone: true })
            .notNull()
            .defaultNow(),

        updatedAt: timestamp("updated_at", { withTimezone: true })
            .notNull()
            .defaultNow(),
    },
    (table) => [
        index("questions_exam_id_idx").on(table.examId),
        index("questions_subject_id_idx").on(table.subjectId),
        index("questions_chapter_id_idx").on(table.chapterId),
        index("questions_year_idx").on(table.year),
    ],
);

/**
 * QUESTION OPTIONS
 */

export const questionOptions = pgTable(
    "question_options",
    {
        id: bigserial("id", { mode: "number" }).primaryKey(),

        questionId: bigint("question_id", { mode: "number" })
            .notNull()
            .references(() => questions.id, { onDelete: "cascade" }),

        label: varchar("label", { length: 1 }).notNull(),

        optionText: text("option_text"),

        optionImageUrl: text("option_image_url"),

        isCorrect: boolean("is_correct").notNull().default(false),

        createdAt: timestamp("created_at", { withTimezone: true })
            .notNull()
            .defaultNow(),

        updatedAt: timestamp("updated_at", { withTimezone: true })
            .notNull()
            .defaultNow(),
    },
    (table) => [
        index("question_options_question_id_idx").on(table.questionId),

        uniqueIndex("unique_question_option_label").on(
            table.questionId,
            table.label,
        ),
    ],
);

/**
 * TEST ATTEMPTS
 */

export const testAttempts = pgTable(
    "test_attempts",
    {
        id: bigserial("id", { mode: "number" }).primaryKey(),

        userId: bigint("user_id", { mode: "number" })
            .notNull()
            .references(() => users.id, { onDelete: "cascade" }),

        examId: bigint("exam_id", { mode: "number" })
            .notNull()
            .references(() => exams.id, { onDelete: "restrict" }),

        testType: testTypeEnum("test_type").notNull().default("pyq_shift_test"),

        attemptStatus: attemptStatusEnum("attempt_status")
            .notNull()
            .default("in_progress"),

        startedAt: timestamp("started_at", { withTimezone: true }).notNull(),

        submittedAt: timestamp("submitted_at", { withTimezone: true }),

        durationSeconds: integer("duration_seconds"),

        totalQuestions: integer("total_questions").notNull(),

        totalMarks: numeric("total_marks", {
            precision: 8,
            scale: 2,
            mode: "number",
        }).notNull(),

        score: numeric("score", {
            precision: 8,
            scale: 2,
            mode: "number",
        }),

        correctCount: integer("correct_count"),

        wrongCount: integer("wrong_count"),

        unattemptedCount: integer("unattempted_count"),

        accuracy: numeric("accuracy", {
            precision: 5,
            scale: 2,
            mode: "number",
        }),

        createdAt: timestamp("created_at", { withTimezone: true })
            .notNull()
            .defaultNow(),

        updatedAt: timestamp("updated_at", { withTimezone: true })
            .notNull()
            .defaultNow(),
    },
    (table) => [
        index("test_attempts_user_id_idx").on(table.userId),
        index("test_attempts_exam_id_idx").on(table.examId),
        index("test_attempts_status_idx").on(table.attemptStatus),
    ],
);

/**
 * TEST QUESTIONS
 *
 * This freezes the selected questions for one test attempt.
 */

export const testQuestions = pgTable(
    "test_questions",
    {
        id: bigserial("id", { mode: "number" }).primaryKey(),

        attemptId: bigint("attempt_id", { mode: "number" })
            .notNull()
            .references(() => testAttempts.id, { onDelete: "cascade" }),

        questionId: bigint("question_id", { mode: "number" })
            .notNull()
            .references(() => questions.id, { onDelete: "restrict" }),

        subjectId: bigint("subject_id", { mode: "number" })
            .notNull()
            .references(() => subjects.id, { onDelete: "restrict" }),

        questionOrder: integer("question_order").notNull(),

        createdAt: timestamp("created_at", { withTimezone: true })
            .notNull()
            .defaultNow(),
    },
    (table) => [
        index("test_questions_attempt_id_idx").on(table.attemptId),
        index("test_questions_question_id_idx").on(table.questionId),

        uniqueIndex("unique_attempt_question_order").on(
            table.attemptId,
            table.questionOrder,
        ),

        uniqueIndex("unique_attempt_question").on(
            table.attemptId,
            table.questionId,
        ),
    ],
);

/**
 * ATTEMPT ANSWERS
 */

export const attemptAnswers = pgTable(
    "attempt_answers",
    {
        id: bigserial("id", { mode: "number" }).primaryKey(),

        attemptId: bigint("attempt_id", { mode: "number" })
            .notNull()
            .references(() => testAttempts.id, { onDelete: "cascade" }),

        testQuestionId: bigint("test_question_id", { mode: "number" })
            .notNull()
            .references(() => testQuestions.id, { onDelete: "cascade" }),

        questionId: bigint("question_id", { mode: "number" })
            .notNull()
            .references(() => questions.id, { onDelete: "restrict" }),

        selectedOptionId: bigint("selected_option_id", { mode: "number" })
            .references(() => questionOptions.id, { onDelete: "set null" }),

        answerText: text("answer_text"),

        isCorrect: boolean("is_correct").notNull().default(false),

        isAttempted: boolean("is_attempted").notNull().default(false),

        isMarkedForReview: boolean("is_marked_for_review").notNull().default(false),

        timeSpentSeconds: integer("time_spent_seconds").notNull().default(0),

        marksAwarded: numeric("marks_awarded", {
            precision: 8,
            scale: 2,
            mode: "number",
        }).notNull(),

        createdAt: timestamp("created_at", { withTimezone: true })
            .notNull()
            .defaultNow(),

        updatedAt: timestamp("updated_at", { withTimezone: true })
            .notNull()
            .defaultNow(),
    },
    (table) => [
        index("attempt_answers_attempt_id_idx").on(table.attemptId),
        index("attempt_answers_question_id_idx").on(table.questionId),

        uniqueIndex("unique_answer_per_test_question").on(
            table.testQuestionId,
        ),
    ],
);

/**
 * TYPES
 */

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type Exam = typeof exams.$inferSelect;
export type NewExam = typeof exams.$inferInsert;

export type Subject = typeof subjects.$inferSelect;
export type NewSubject = typeof subjects.$inferInsert;

export type Chapter = typeof chapters.$inferSelect;
export type NewChapter = typeof chapters.$inferInsert;

export type Question = typeof questions.$inferSelect;
export type NewQuestion = typeof questions.$inferInsert;

export type QuestionOption = typeof questionOptions.$inferSelect;
export type NewQuestionOption = typeof questionOptions.$inferInsert;

export type TestAttempt = typeof testAttempts.$inferSelect;
export type NewTestAttempt = typeof testAttempts.$inferInsert;

export type TestQuestion = typeof testQuestions.$inferSelect;
export type NewTestQuestion = typeof testQuestions.$inferInsert;

export type AttemptAnswer = typeof attemptAnswers.$inferSelect;
export type NewAttemptAnswer = typeof attemptAnswers.$inferInsert;