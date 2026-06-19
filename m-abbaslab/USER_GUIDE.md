# M-AbbasLab User Guide

## How to Use This Site

### As a Visitor

**Homepage** (`/`) — The landing page with 3D brain animation, stats, featured work, and latest articles. Click any section to explore.

**About** (`/about`) — Learn about Mohammed Abbas, his background, education at Chuka University, and professional goals.

**Work** (`/work`) — Browse all projects with search and filter by category (Research, Technology, Analysis). Click any project card for full details. Includes the M-Abbas AI humanoid robot showcase.

**Articles** (`/articles`) — Read articles filtered by category (Research Papers, Blog Posts, Technical Guides). Each article has markdown rendering, table of contents, and share buttons.

**Fashion** (`/fashion`) — Fashion portfolio with categories (Streetwear, Casual, Formal, Sportswear, Accessories). Includes runway journey timeline and booking rates. Visit the Gallery for a visual archive.

**Contact** (`/contact`) — Send a message via the contact form (powered by Web3Forms). Includes booking cards, social links, testimonials, FAQ, and newsletter signup.

**CV Generator** (`/cv-generator`) — Build a professional CV in 7 steps. AI generates 3 variants + cover letter + interview questions. ATS scoring included. Small fee (1000 NGN) for PDF download via Paystack.

**JARVIS Chat** — Click the floating chat button (bottom-right) to talk to the AI assistant. Ask about Mohammed's work, projects, skills, or anything else.

**Academic Docs** — Read academic research:
- ILMS (`/work/academic/ilms`) — 15 chapters
- SkillSync (`/work/academic/skillsync`) — 4 chapters
- Economics (`/work/academic/economics`) — 11 chapters

**QIS Portal** (`/quantum-impact-syndicate`) — Members-only portal for Quantum Impact Syndicate. Sign up or sign in with Supabase auth. Access doctrine, strategy decks, projects, and profile.

---

### As Admin

#### Logging In

1. Go to `/admin/login`
2. Enter credentials: `admin` / `Mohabmabz@35*`
3. You'll be redirected to the dashboard

#### Dashboard Overview

The admin dashboard has a **sidebar with 20+ tabs**. Each tab manages a different part of the site.

#### Managing Content

**Projects Tab:**
- View all projects in a list
- Click "Add Project" to create new ones
- Fill in title, description, status, category, tags
- Upload project image (max 1MB, stored on Cloudinary)
- Edit or delete existing projects
- Changes appear on `/work` immediately

**Articles Tab:**
- Full article management with create/edit/delete
- Write in markdown with preview
- Set categories, tags, featured image
- Publish or save as draft
- Share buttons auto-generated

**Fashion Tab:**
- Manage fashion portfolio items
- Upload images (max 1MB)
- Categorize by type (Streetwear, Casual, etc.), season, brand
- Items appear on `/fashion` and `/fashion/gallery`

**Runway Tab:**
- Track modeling career milestones
- Add events with dates, descriptions, images
- Status tracking (completed, upcoming, in-progress)

#### Discipline OS

Your personal daily operating system:

1. **Day Tab** — Plan your 24 hours by assigning categories to each hour block
2. **Habits Tab** — Track daily habits using the Atomic Habits framework:
   - Green check = completed, click to toggle
   - Scorecard: +1 (good), -1 (bad), 0 (neutral) — click the score button
   - Streaks track consecutive days
   - 2-minute rule badges show easy habits
   - Habit stacking shows which habits chain together
   - Click "Add Habit" to create custom ones
3. **Goals Tab** — Set 12 goals across 6 categories (Finance, Career, Health, etc.)
4. **Reviews Tab** — Write daily/weekly/monthly/quarterly/yearly reviews
5. **AI Coach Tab** — Get AI-powered discipline advice (Daily Review, Habit Analysis, Weekly Summary)
6. **Diary Tab** — Journal daily with mood tracking, tags, and AI reflections
7. **Mentors Tab** — Read wisdom from historical figures (Machiavelli, Sun Tzu, etc.)

Everything auto-saves after 1.5 seconds of inactivity.

#### Finance Tracker

Track income and expenses:
- Add transactions with type, amount, category, date
- View summary cards (total income, expenses, net balance)
- Set daily income target and track progress
- Upload CSV/PDF bank statements for AI analysis
- Export to PDF

#### WorldQuant Lab

Alpha generation engine:
- Click "Start Engine" to begin generating alpha expressions
- Monitor real-time progress (tested/passed/failed)
- View alpha details with PnL curves
- Health monitoring dashboard
- Export report to PDF
- Runs automatically every 2 hours via cron

#### Content Scheduler

Schedule social media posts:
- Create posts with platform targeting (Twitter, LinkedIn, Facebook, etc.)
- AI-powered content repurposing from articles
- Calendar view for scheduling
- Immediate posting or scheduled delivery

#### JARVIS HUB

AI management center:
- **Brain** — Configure auto-response rules with keywords
- **Advanced** — WhatsApp group monitoring, status updates
- **Learning** — View and rate AI interactions
- **Inbox** — Read and reply to WhatsApp messages
- **Settings** — AI model, tone, business hours, language

#### Comms Hub

Communication center:
- WhatsApp message broadcaster
- Send to contacts or groups
- Message templates
- Delivery tracking

#### Settings

Configure the entire site:
- Site name, tagline, features
- Social media links
- Admin credentials
- System configuration

---

### As a CV Generator User

1. Visit `/cv-generator`
2. Click "Start Building"
3. Fill in 7 steps: Personal Info, Education, Experience, Skills, Projects, References, Review
4. AI generates 3 CV variants + cover letter + interview questions
5. View ATS score and optimization tips
6. Pay 1000 NGN via Paystack to download PDF
7. Track job applications in the dashboard

---

### As a QIS Member

1. Visit `/quantum-impact-syndicate`
2. Sign up or sign in
3. Access the portal:
   - **Dashboard** — Overview and quick actions
   - **Doctrine** — Read the QIS doctrine document
   - **Decks** — View strategy presentations
   - **Projects** — Browse and manage QIS projects
   - **Profile** — Edit your member profile

---

## Troubleshooting

### Site looks empty
- Check that Supabase is connected (look for the env vars)
- The site falls back to `config/personal.ts` when Supabase is unavailable

### Images not loading
- Check Cloudinary credentials in `.env.local`
- Images must be under 1MB
- Supported formats: JPG, PNG, GIF, WebP

### Admin login fails
- Check `ADMIN_SECRET` matches in both `ADMIN_SECRET` and `NEXT_PUBLIC_ADMIN_SECRET`
- Rate limiting may lock you out after 5 failed attempts (resets on deploy)

### WhatsApp not connecting
- The Baileys engine must be deployed separately to Fly.io
- Check `JARVIS_ENGINE_URL` env var in Vercel
- Engine runs on port 3009 locally

### AI chat not responding
- Check `OPENROUTER_API_KEY` or `GLM_API_KEY` in `.env.local`
- Free tier models have rate limits

### Build fails
- Run `npm install --legacy-peer-deps`
- Ensure all env vars are set (even empty strings)
- Check `npx tsc --noEmit` for type errors
