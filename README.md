# PYQVerse

> A full-stack competitive exam mock test platform with Previous Year Questions (PYQs), timed mock tests, performance analytics, and an exam-like practice experience.

## Overview

PYQVerse is designed for **JEE Main preparation** with a scalable architecture built to support multiple competitive exams (NEET, GATE, CUET, SSC, UPSC). It provides an authentic exam experience using real previous year questions, comprehensive analytics, and interactive tools for mastering competitive exams.

---

## ✨ Features

### Test Experience
- JEE Main Previous Year Question (PYQ) mock tests
- Exam-style test interface with authentic UX
- Timed test attempts with countdown timer
- Question palette navigation for quick access
- Mark for review functionality
- Previous / Next question navigation

### Question Handling
- Image-based question and option rendering
- Solution with images and text
- Mathematical notation rendering using KaTeX
- Support for single correct and numerical questions
- Difficulty classification (Easy, Medium, Hard)

### Performance & Analytics
- Real-time score calculation
- Attempt history and comparison
- Accuracy metrics
- Subject-wise performance breakdown
- Time analysis per question

### User Experience
- Responsive design for desktop and mobile
- Intuitive test interface
- Clean UI with Tailwind CSS 4
- Scalable architecture for future expansion

### Supported Exams
- **Current:** JEE Main
- **Planned:** NEET, GATE, CUET, SSC, UPSC

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- npm/yarn/pnpm/bun

### Setup & Run
```bash
# Install dependencies
npm install

# Setup environment variables (copy .env.example to .env.local)
# Configure DATABASE_URL and other secrets

# Run migrations
npm run db:push

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS 4 |
| **Backend** | Next.js Route Handlers, Node.js |
| **Database** | PostgreSQL with Drizzle ORM |
| **Media** | Cloudinary (images) |
| **Math Rendering** | KaTeX + react-katex |
| **Development** | ESLint, Drizzle Kit, dotenv |

### Architecture

```mermaid
flowchart LR
    UI["Next.js UI<br/>(App Router)"]
    API["Route Handlers<br/>(app/api)"]
    DB[("PostgreSQL<br/>(Drizzle ORM)")]
    CDN["Cloudinary<br/>(Media)"]
    
    UI -->|HTTP| API
    API -->|SQL| DB
    UI -->|Fetch| CDN
    API -->|Upload| CDN
    
    style UI fill:#000
    style API fill:#0ea
    style DB fill:#336
    style CDN fill:#44f
```

---

## 📁 Project Structure

```mermaid
flowchart TB
    ROOT["cbt-based-exam-app/"]
    
    APP["app/"]
    API["app/api/"]
    PAGES["app/pages/"]
    COMPONENTS["components/"]
    DB_LAYER["db/"]
    MIGRATIONS["drizzle/"]
    LIB["lib/"]
    PUBLIC["public/"]
    TYPES["types/"]
    CONFIG["config files"]
    
    ROOT --> APP
    APP --> API
    APP --> PAGES
    ROOT --> COMPONENTS
    ROOT --> DB_LAYER
    ROOT --> MIGRATIONS
    ROOT --> LIB
    ROOT --> PUBLIC
    ROOT --> TYPES
    ROOT --> CONFIG
    
    PAGES --> "page.tsx<br/>tests-list, test-attempt<br/>results, general-instructions"
    API --> "attempt, exam, submit-attempt<br/>user management"
    COMPONENTS --> "question-renderer.tsx<br/>UI components"
    DB_LAYER --> "schema.ts (Drizzle)"
    MIGRATIONS --> "migration files"
    LIB --> "cloudinary.ts, db.ts"
    CONFIG --> "next.config.ts<br/>drizzle.config.ts<br/>tsconfig.json"
```

---

## 🗄 Database Design

The database follows an entity-relationship model optimized for exam management and attempt tracking:

```mermaid
erDiagram
    USERS ||--o{ TEST_ATTEMPTS : "takes"
    EXAMS ||--o{ SUBJECTS : "includes"
    EXAMS ||--o{ QUESTIONS : "contains"
    SUBJECTS ||--o{ CHAPTERS : "organized_by"
    SUBJECTS ||--o{ QUESTIONS : "categorized_in"
    CHAPTERS ||--o{ QUESTIONS : "grouped_by"
    QUESTIONS ||--o{ QUESTION_OPTIONS : "has"
    TEST_ATTEMPTS ||--o{ TEST_QUESTIONS : "includes"
    TEST_QUESTIONS ||--|| QUESTIONS : "references"
    TEST_ATTEMPTS ||--o{ ATTEMPT_ANSWERS : "records"
    ATTEMPT_ANSWERS ||--|| TEST_QUESTIONS : "answers"
    ATTEMPT_ANSWERS ||--o{ QUESTION_OPTIONS : "selects"

    USERS {
        bigint id PK
        varchar email UK
        varchar name
        text image
        enum role "student|admin"
    }

    EXAMS {
        bigint id PK
        varchar name
        int duration_seconds
        int total_questions
        int marks
        enum exam_type "previous_year|mock|chapter_test|subject_test"
    }

    SUBJECTS {
        bigint id PK
        bigint exam_id FK
        varchar name
        int total_questions
        numeric marks
    }

    CHAPTERS {
        bigint id PK
        bigint subject_id FK
        text name
    }

    QUESTIONS {
        bigint id PK
        bigint exam_id FK
        bigint subject_id FK
        bigint chapter_id FK
        text question_text
        text question_image_url
        text solution_text
        text solution_image_url
        enum question_type "single_correct|numerical"
        int year
        text session
        text shift
        enum difficulty "easy|medium|hard"
        int marks
        int negative_marks
    }

    QUESTION_OPTIONS {
        bigint id PK
        bigint question_id FK
        varchar label
        text option_text
        text option_image_url
        boolean is_correct
    }

    TEST_ATTEMPTS {
        bigint id PK
        bigint user_id FK
        bigint exam_id FK
        enum test_type
        enum attempt_status "in_progress|submitted|abandoned|expired"
        timestamp started_at
        timestamp submitted_at
        int total_questions
        numeric total_marks
        numeric score
        int correct_count
        int wrong_count
        int unattempted_count
        numeric accuracy
    }

    TEST_QUESTIONS {
        bigint id PK
        bigint attempt_id FK
        bigint question_id FK
        bigint subject_id FK
        int question_order UK
    }

    ATTEMPT_ANSWERS {
        bigint id PK
        bigint attempt_id FK
        bigint test_question_id FK
        bigint selected_option_id FK
        text answer_text
        boolean is_correct
        boolean is_attempted
        boolean is_marked_for_review
        int time_spent_seconds
        numeric marks_awarded
    }
```

### Key Design Principles

- **Separation of Concerns:** Questions are stored globally; test-specific questions are frozen in `TEST_QUESTIONS`
- **Answer Tracking:** `ATTEMPT_ANSWERS` records user responses with metadata (time, correctness, marks)
- **Scalability:** Exam structure (exam → subjects → chapters) supports multiple exam types
- **Indexing:** Strategic indexes on foreign keys and frequently queried columns for performance

