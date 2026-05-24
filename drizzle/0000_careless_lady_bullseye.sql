CREATE TYPE "public"."attempt_status" AS ENUM('in_progress', 'submitted', 'abandoned', 'expired');--> statement-breakpoint
CREATE TYPE "public"."difficulty" AS ENUM('easy', 'medium', 'hard');--> statement-breakpoint
CREATE TYPE "public"."exam_type" AS ENUM('previous_year', 'mock', 'chapter_test', 'subject_test');--> statement-breakpoint
CREATE TYPE "public"."question_type" AS ENUM('single_correct', 'numerical');--> statement-breakpoint
CREATE TYPE "public"."test_type" AS ENUM('pyq_shift_test', 'full_mock', 'subject_test', 'chapter_test', 'custom_test');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('student', 'admin');--> statement-breakpoint
CREATE TABLE "attempt_answers" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"attempt_id" bigint NOT NULL,
	"test_question_id" bigint NOT NULL,
	"question_id" bigint NOT NULL,
	"selected_option_id" bigint,
	"answer_text" text,
	"is_correct" boolean DEFAULT false NOT NULL,
	"is_attempted" boolean DEFAULT false NOT NULL,
	"is_marked_for_review" boolean DEFAULT false NOT NULL,
	"time_spent_seconds" integer DEFAULT 0 NOT NULL,
	"marks_awarded" numeric(8, 2) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "chapters" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"subject_id" bigint NOT NULL,
	"name" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "exams" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"name" varchar(200) NOT NULL,
	"duration_seconds" integer NOT NULL,
	"total_questions" integer NOT NULL,
	"marks" integer NOT NULL,
	"exam_type" "exam_type" DEFAULT 'previous_year' NOT NULL,
	"is_free" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "question_options" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"question_id" bigint NOT NULL,
	"label" varchar(1) NOT NULL,
	"option_text" text,
	"option_image_url" text,
	"is_correct" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "questions" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"exam_id" bigint NOT NULL,
	"subject_id" bigint NOT NULL,
	"chapter_id" bigint,
	"question_text" text,
	"question_image_url" text,
	"solution_text" text,
	"solution_image_url" text,
	"question_type" "question_type" NOT NULL,
	"correct_answer_text" text,
	"year" integer,
	"paper_date" date,
	"session" text,
	"shift" text,
	"difficulty" "difficulty",
	"marks" integer DEFAULT 4 NOT NULL,
	"negative_marks" integer DEFAULT -1 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "subjects" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"exam_id" bigint NOT NULL,
	"name" varchar(100) NOT NULL,
	"total_questions" integer NOT NULL,
	"marks" numeric(8, 2) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "test_attempts" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"user_id" bigint NOT NULL,
	"exam_id" bigint NOT NULL,
	"test_type" "test_type" DEFAULT 'pyq_shift_test' NOT NULL,
	"attempt_status" "attempt_status" DEFAULT 'in_progress' NOT NULL,
	"started_at" timestamp with time zone NOT NULL,
	"submitted_at" timestamp with time zone,
	"duration_seconds" integer,
	"total_questions" integer NOT NULL,
	"total_marks" numeric(8, 2) NOT NULL,
	"score" numeric(8, 2),
	"correct_count" integer,
	"wrong_count" integer,
	"unattempted_count" integer,
	"accuracy" numeric(5, 2),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "test_questions" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"attempt_id" bigint NOT NULL,
	"question_id" bigint NOT NULL,
	"subject_id" bigint NOT NULL,
	"question_order" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	"email" varchar(150) NOT NULL,
	"image" text,
	"role" "user_role" DEFAULT 'student' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "attempt_answers" ADD CONSTRAINT "attempt_answers_attempt_id_test_attempts_id_fk" FOREIGN KEY ("attempt_id") REFERENCES "public"."test_attempts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "attempt_answers" ADD CONSTRAINT "attempt_answers_test_question_id_test_questions_id_fk" FOREIGN KEY ("test_question_id") REFERENCES "public"."test_questions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "attempt_answers" ADD CONSTRAINT "attempt_answers_question_id_questions_id_fk" FOREIGN KEY ("question_id") REFERENCES "public"."questions"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "attempt_answers" ADD CONSTRAINT "attempt_answers_selected_option_id_question_options_id_fk" FOREIGN KEY ("selected_option_id") REFERENCES "public"."question_options"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "chapters" ADD CONSTRAINT "chapters_subject_id_subjects_id_fk" FOREIGN KEY ("subject_id") REFERENCES "public"."subjects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "question_options" ADD CONSTRAINT "question_options_question_id_questions_id_fk" FOREIGN KEY ("question_id") REFERENCES "public"."questions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "questions" ADD CONSTRAINT "questions_exam_id_exams_id_fk" FOREIGN KEY ("exam_id") REFERENCES "public"."exams"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "questions" ADD CONSTRAINT "questions_subject_id_subjects_id_fk" FOREIGN KEY ("subject_id") REFERENCES "public"."subjects"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "questions" ADD CONSTRAINT "questions_chapter_id_chapters_id_fk" FOREIGN KEY ("chapter_id") REFERENCES "public"."chapters"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subjects" ADD CONSTRAINT "subjects_exam_id_exams_id_fk" FOREIGN KEY ("exam_id") REFERENCES "public"."exams"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "test_attempts" ADD CONSTRAINT "test_attempts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "test_attempts" ADD CONSTRAINT "test_attempts_exam_id_exams_id_fk" FOREIGN KEY ("exam_id") REFERENCES "public"."exams"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "test_questions" ADD CONSTRAINT "test_questions_attempt_id_test_attempts_id_fk" FOREIGN KEY ("attempt_id") REFERENCES "public"."test_attempts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "test_questions" ADD CONSTRAINT "test_questions_question_id_questions_id_fk" FOREIGN KEY ("question_id") REFERENCES "public"."questions"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "test_questions" ADD CONSTRAINT "test_questions_subject_id_subjects_id_fk" FOREIGN KEY ("subject_id") REFERENCES "public"."subjects"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "attempt_answers_attempt_id_idx" ON "attempt_answers" USING btree ("attempt_id");--> statement-breakpoint
CREATE INDEX "attempt_answers_question_id_idx" ON "attempt_answers" USING btree ("question_id");--> statement-breakpoint
CREATE UNIQUE INDEX "unique_answer_per_test_question" ON "attempt_answers" USING btree ("test_question_id");--> statement-breakpoint
CREATE INDEX "chapters_subject_id_idx" ON "chapters" USING btree ("subject_id");--> statement-breakpoint
CREATE INDEX "question_options_question_id_idx" ON "question_options" USING btree ("question_id");--> statement-breakpoint
CREATE UNIQUE INDEX "unique_question_option_label" ON "question_options" USING btree ("question_id","label");--> statement-breakpoint
CREATE INDEX "questions_exam_id_idx" ON "questions" USING btree ("exam_id");--> statement-breakpoint
CREATE INDEX "questions_subject_id_idx" ON "questions" USING btree ("subject_id");--> statement-breakpoint
CREATE INDEX "questions_chapter_id_idx" ON "questions" USING btree ("chapter_id");--> statement-breakpoint
CREATE INDEX "questions_year_idx" ON "questions" USING btree ("year");--> statement-breakpoint
CREATE INDEX "subjects_exam_id_idx" ON "subjects" USING btree ("exam_id");--> statement-breakpoint
CREATE INDEX "test_attempts_user_id_idx" ON "test_attempts" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "test_attempts_exam_id_idx" ON "test_attempts" USING btree ("exam_id");--> statement-breakpoint
CREATE INDEX "test_attempts_status_idx" ON "test_attempts" USING btree ("attempt_status");--> statement-breakpoint
CREATE INDEX "test_questions_attempt_id_idx" ON "test_questions" USING btree ("attempt_id");--> statement-breakpoint
CREATE INDEX "test_questions_question_id_idx" ON "test_questions" USING btree ("question_id");--> statement-breakpoint
CREATE UNIQUE INDEX "unique_attempt_question_order" ON "test_questions" USING btree ("attempt_id","question_order");--> statement-breakpoint
CREATE UNIQUE INDEX "unique_attempt_question" ON "test_questions" USING btree ("attempt_id","question_id");