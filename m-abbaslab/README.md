# M-AbbasLab

> **Personal Operating Platform** — A full-stack Next.js application serving as a digital workspace, portfolio, AI assistant, and productivity system.

![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)
![React](https://img.shields.io/badge/React-19-61dafb?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)
![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3fcf8e?logo=supabase)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38bdf8?logo=tailwindcss)
![Deployed on Vercel](https://img.shields.io/badge/Deployed-Vercel-black?logo=vercel)

---

## What This Is

M-AbbasLab is Mohammed Abbas's personal website and operating platform. It's not just a portfolio — it's a **full business operating system** that includes:

- **Public Portfolio** — Projects, articles, fashion work, academic research
- **Admin Command Center** — 20+ tab dashboard managing everything from content to finance
- **AI Assistant (JARVIS)** — Chatbot powered by multiple AI providers
- **Discipline OS** — Daily habit tracker with Atomic Habits framework
- **WorldQuant Lab** — Quantitative alpha generation engine
- **CV Generator** — AI-powered resume builder with Paystack payments
- **Content Scheduler** — Social media post scheduling
- **WhatsApp Integration** — Baileys engine for messaging automation
- **Finance Tracker** — Income/expense tracking with AI analysis

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router, Turbopack) |
| Language | TypeScript 5 (strict mode) |
| UI | React 19, Tailwind CSS 4, Framer Motion |
| 3D | Three.js, React Three Fiber |
| Database | Supabase (PostgreSQL) |
| Auth | JWT (jose), bcryptjs |
| AI | OpenRouter (Gemini, Llama), Anthropic (Claude), GLM-4.7 |
| Image Upload | Cloudinary |
| Payments | Paystack |
| Icons | Lucide React |
| PDF | html2pdf.js, pdf-parse |
| PWA | Service Worker (manual), manifest.json |
| Deployment | Vercel |

---

## Project Structure

```
m-abbaslab/
├── app/                        # Next.js App Router pages
│   ├── (public routes)/        # /, /about, /work, /articles, /fashion, /contact
│   ├── admin/                  # Admin panel (JWT-protected)
│   │   ├── dashboard/          # Main command center with 20+ tabs
│   │   ├── login/              # Admin login
│   │   └── [sections]/         # Individual admin pages
│   ├── api/                    # API routes
│   │   ├── admin/              # Admin APIs (27+ routes)
│   │   ├── cron/               # Vercel cron jobs (3)
│   │   ├── cv/                 # CV Generator APIs (7)
│   │   ├── public/             # Public data APIs (6)
│   │   └── [root]/             # Root APIs (schedule, contact, analytics, jarvis)
│   ├── cv-generator/           # CV Generator pages
│   ├── portal/                 # QIS member portal
│   └── work/academic/          # Academic documentation (ILMS, SkillSync, Economics)
├── components/
│   ├── admin/                  # 28 admin panel components
│   ├── sections/               # Homepage sections
│   ├── ui/                     # Shared UI components
│   └── [root]/                 # Navbar, Footer, etc.
├── config/
│   └── personal.ts             # Site configuration (fallback when Supabase unavailable)
├── lib/
│   ├── supabase.ts             # Supabase client
│   ├── ai-personality.ts       # AI personality system
│   ├── alphaEngine.ts          # Alpha generation logic
│   └── [utilities]
├── jarvis-whatsapp-engine/     # WhatsApp Baileys engine (standalone)
├── public/
│   ├── icons/                  # PWA icons (SVG)
│   ├── images/                 # Static images
│   └── sw.js                   # Service worker
├── supabase/                   # SQL migration files
└── middleware.ts               # JWT auth middleware for /admin/*
```

---

## Getting Started

### Prerequisites

- Node.js 18+ (recommended: 20)
- npm or yarn
- Supabase account (free tier works)
- Cloudinary account (free tier works)

### 1. Clone & Install

```bash
git clone https://github.com/Mohabz35/m-abbaslab.git
cd m-abbaslab/m-abbaslab
npm install --legacy-peer-deps
```

### 2. Environment Variables

Copy `.env.example` to `.env.local` and fill in:

```bash
# REQUIRED — Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_KEY=your-service-role-key
SUPABASE_DB_PASSWORD=your-db-password

# REQUIRED — Admin
ADMIN_SECRET=your-admin-secret
NEXT_PUBLIC_ADMIN_SECRET=your-admin-secret

# OPTIONAL — AI Providers
OPENROUTER_API_KEY=sk-or-v1-...
GLM_API_KEY=your-glm-key
ANTHROPIC_API_KEY=sk-ant-...

# OPTIONAL — Image Upload
CLOUDINARY_CLOUD_NAME=your-cloud
CLOUDINARY_API_KEY=your-key
CLOUDINARY_API_SECRET=your-secret

# OPTIONAL — Payments
PAYSTACK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_test_...

# OPTIONAL — Contact Form
WEB3FORMS_ACCESS_KEY=your-key

# OPTIONAL — Social Media
TWITTER_API_KEY=
TWITTER_API_SECRET=
TWITTER_ACCESS_TOKEN=
TWITTER_ACCESS_TOKEN_SECRET=
LINKEDIN_ACCESS_TOKEN=
WHATSAPP_ACCESS_TOKEN=
WHATSAPP_PHONE_NUMBER_ID=

# OPTIONAL — Cron Jobs
CRON_SECRET=your-cron-secret

# OPTIONAL — Google Analytics
NEXT_PUBLIC_GA_ID=
```

### 3. Database Setup

Run the SQL migrations in your Supabase SQL Editor in this order:

1. `supabase/complete_schema.sql` — Core tables (projects, articles, fashion, etc.)
2. `supabase/discipline_analytics_schema.sql` — Discipline tracker tables
3. `supabase/migration_fix_tables.sql` — Additional tables (diary, finance targets, etc.)
4. `supabase/ai_knowledge_base.sql` — AI knowledge base and chat sessions

### 4. Run Development Server

```bash
npm run dev
```

Visit `http://localhost:3000` — your site is live.

### 5. Admin Panel

Navigate to `/admin/login` and log in with:
- **Username:** `admin`
- **Password:** `Mohabmabz@35*`

---

## Admin Dashboard Features

The admin dashboard (`/admin/dashboard`) has 20+ tabs:

| Tab | What It Does |
|-----|-------------|
| **Overview** | Real-time stats from Supabase — projects, articles, messages, finance |
| **Projects** | CRUD projects with image upload (1MB max, Cloudinary) |
| **Articles** | CRUD articles with markdown, categories, tags, image upload |
| **Alphas** | WorldQuant Lab — generate and monitor alpha formulas |
| **JARVIS HUB** | AI settings, learning rules, WhatsApp inbox, group monitoring |
| **Comms Hub** | Communications center with WhatsApp broadcaster |
| **Content Scheduler** | Schedule social media posts (Twitter, LinkedIn, Facebook, etc.) |
| **Zapier & Automation** | Webhook management and automation triggers |
| **Discipline OS** | Daily life tracker — habits (Atomic Habits), goals, reviews, diary, AI coaching |
| **Finance Tracker** | Income/expense tracking, daily targets, AI financial analysis |
| **Messages** | Contact form submissions |
| **Subscribers** | Email subscriber management |
| **Analytics** | Page views, user events, traffic analysis |
| **Reports** | Advanced reporting dashboard |
| **Fashion** | Fashion portfolio management with image upload |
| **Runway** | Modeling career timeline/journey |
| **Team** | Team member management |
| **Backups** | Data backup management |
| **Audit Logs** | Security audit trail |
| **Settings** | Site configuration, system settings, security |

---

## Key Features

### Discipline OS

A comprehensive daily life management system:

- **Day Planner** — Hour-by-hour schedule (24 blocks)
- **5 Pillars** — Mind, Body, Soul, Wealth, Relationships (scored 1-10)
- **Atomic Habits** — Scorecard (+1/-1/0), habit stacking, 2-minute rule, cue triggers
- **Goal Tracking** — 12 goals across 6 categories
- **AI Coach** — OpenRouter-powered discipline coaching
- **Diary/Journal** — Mood tracking, tags, AI reflections
- **Reviews** — Daily, weekly, monthly, quarterly, yearly
- **Mentors** — Wisdom from historical figures
- **Auto-save** — Debounced 1.5s auto-save with indicator

### WorldQuant Lab

Quantitative finance alpha generation:

- **Alpha Engine** — Generates mathematical expressions for market prediction
- **Batch Runs** — Run 10+ alphas per batch
- **Performance Metrics** — Sharpe ratio, annual return, max drawdown, win rate
- **Health Monitoring** — System health logs and notifications
- **24/7 Operation** — Cron job every 2 hours

### CV Generator

AI-powered resume builder:

- **7-Step Builder** — Personal info, education, experience, skills, projects, references
- **AI Generation** — 3 CV variants + cover letter + interview questions
- **ATS Scoring** — Resume scoring against job descriptions
- **Payment** — Paystack integration (1000 NGN per download)
- **Job Tracker** — Track applications and follow-ups

### AI System (JARVIS)

Multi-provider AI assistant:

- **Public Chat** — GLM-4.7 via OpenRouter (floating launcher)
- **Admin Chat** — Context-aware personality system (friend/professional/mentor modes)
- **Discipline Coaching** — Habit analysis and daily reviews
- **Knowledge Base** — Auto-synced from projects, articles, fashion, profile
- **WhatsApp AI** — Claude-powered auto-replies via Baileys engine

---

## Cron Jobs

| Job | Schedule | What It Does |
|-----|----------|-------------|
| `/api/cron/process-queue` | Daily midnight UTC | Processes scheduled social media posts |
| `/api/cron/alpha-engine` | Every 2 hours | Generates alpha expression batches |
| `/api/cron/daily-wisdom` | Daily 6 AM UTC | Sets daily wisdom quote |

---

## Supabase Tables (47 total)

### Core
`projects`, `articles`, `fashion_items`, `runway_journey`, `finance_entries`, `finance_goals`

### System
`site_config`, `audit_logs`, `admin_users`, `security_events`, `admin_backups`

### WhatsApp
`whatsapp_messages`, `whatsapp_connection_status`, `whatsapp_subscribers`, `whatsapp_broadcasts`, `whatsapp_broadcast_logs`, `whatsapp_groups`, `whatsapp_status_updates`

### WorldQuant
`alphas`, `alpha_batches`, `failed_alphas`, `wq_health_log`, `wq_notifications`

### Discipline
`discipline_days`, `discipline_goals`, `discipline_habits`, `discipline_passive`, `discipline_reviews`, `discipline_diary`, `finance_daily_targets`

### AI
`ai_knowledge_base`, `chat_sessions`

### CV Generator
`cv_users`, `cv_form_data`, `cv_generations`, `cv_tracked_jobs`, `paystack_transactions`

### Analytics
`analytics_events`, `scheduled_posts`

### QIS Portal
`qis_members`, `qis_projects`, `qis_project_members`, `qis_documents`, `qis_applications`, `qis_audit_log`

---

## Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import in Vercel dashboard
3. Set environment variables
4. Deploy — Vercel handles everything

### WhatsApp Engine (Fly.io)

The WhatsApp Baileys engine runs separately:

```bash
cd jarvis-whatsapp-engine
fly auth login
fly launch
fly secrets set SUPABASE_URL=... SUPABASE_SERVICE_KEY=... ANTHROPIC_API_KEY=...
fly deploy
```

Then set `JARVIS_ENGINE_URL` in Vercel to `https://jarvis-whatsapp-engine.fly.dev`.

---

## Security Notes

- Admin routes are JWT-protected via `middleware.ts`
- All admin API routes require `x-admin-secret` header or JWT cookie
- Image uploads limited to 1MB (server-side + client-side)
- PDF uploads limited to 5MB
- CSP headers configured in `next.config.ts`
- HSTS enabled (1 year)
- Rate limiting on admin login (in-memory, resets on deploy)

---

## License

Private — Mohammed Abbas. All rights reserved.
