# AI-VANTAGE — Deployment Guide (Vercel + Supabase)

## Overview

| Layer | Service | Notes |
|-------|---------|-------|
| Frontend + API routes | Vercel | Free hobby tier works |
| Database | Supabase (PostgreSQL) | Free tier: 500 MB, plenty for this app |
| AI providers | Groq / Gemini / OpenRouter / Anthropic | At least one required |
| News sources | 30+ RSS feeds + optional API keys | RSS works with zero keys |

---

## Step 1 — Supabase Setup

### 1.1 Create a project

1. Go to [supabase.com](https://supabase.com) → **Sign up / Log in**
2. Click **New project**
3. Choose a name, set a strong database password, pick the region closest to your users
4. Wait ~2 minutes for provisioning

### 1.2 Run the schema

1. In your Supabase project sidebar, go to **SQL Editor**
2. Click **New query**
3. Open `supabase/schema.sql` from this repo and paste the entire contents
4. Click **Run** (green button)

This creates four tables: `users`, `sessions`, `user_api_keys`, `reports`.

### 1.3 Get your credentials

Go to **Settings → API** (left sidebar):

| Value | Where to find it | Env var name |
|-------|-----------------|--------------|
| Project URL | "Project URL" field | `SUPABASE_URL` |
| Service role key | "Project API keys" → `service_role` → **Reveal** | `SUPABASE_SERVICE_ROLE_KEY` |

> **Important:** Use the `service_role` key, NOT the `anon` key. The service role bypasses Row Level Security and is needed for server-side operations. Never expose it to the browser.

---

## Step 2 — Vercel Deployment

### 2.1 Push to GitHub

```bash
git init          # if not already a git repo
git add .
git commit -m "initial commit"
git remote add origin https://github.com/your-username/your-repo.git
git push -u origin main
```

### 2.2 Import on Vercel

1. Go to [vercel.com](https://vercel.com) → **Add New Project**
2. Import your GitHub repository
3. Set **Root Directory** to `newsroom-virlo` (important — the Next.js app is in this subfolder)
4. Framework preset: **Next.js** (auto-detected)
5. Do NOT click Deploy yet — add environment variables first

### 2.3 Add environment variables

Go to **Settings → Environment Variables** in your Vercel project and add the following.

#### Required (app will not start without these)

```
SUPABASE_URL                  https://xxxxxxxxxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY     eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
NEXT_PUBLIC_APP_URL           https://your-app.vercel.app
```

#### AI Providers — add at least one

The app tries providers in this order: **Groq → OpenRouter → Gemini → Anthropic**.
If one hits a rate limit it falls back automatically to the next model / key / provider.

```
# Groq — fastest, generous free tier — https://console.groq.com
GROQ_API_KEY=
GROQ_API_KEY_1=      # optional: add up to 10 keys to spread quota
GROQ_API_KEY_2=

# Google Gemini — https://aistudio.google.com
GEMINI_API_KEY=

# OpenRouter — free model tier available — https://openrouter.ai
OPENROUTER_API_KEY=

# Anthropic Claude — https://console.anthropic.com
ANTHROPIC_API_KEY=
```

#### News API Keys — all optional, more = better coverage

```
GNEWS_API_KEY=          # https://gnews.io  — 100 req/day free
NEWS_API_KEY=           # https://newsapi.org — 100 req/day free (dev plan)
GUARDIAN_API_KEY=       # https://open-platform.theguardian.com — 5,000 req/day free
NYT_API_KEY=            # https://developer.nytimes.com — 500 req/day free
CURRENTS_API_KEY=       # https://currentsapi.services — 600 req/day free
NEWSDATA_API_KEY=       # https://newsdata.io — 200 credits/day free
MEDIASTACK_API_KEY=     # https://mediastack.com — 500 req/month free
WORLDNEWS_API_KEY=      # https://worldnewsapi.com — 100 req/day free
PERIGON_API_KEY=        # https://goperigon.com — 100 req/day free

# Google Custom Search — optional broader web results
GOOGLE_API_KEY=
GOOGLE_CSE_ID=

# Virlo Platform — powers trending hashtags section on landing page
VIRLO_API_KEY=
```

> The app works with **zero news API keys** — it falls back to 30+ RSS feeds and Google News RSS automatically. API keys just add more sources and higher volume.

### 2.4 Deploy

Click **Deploy**. Vercel will build and deploy automatically. First build takes ~2 minutes.

---

## Step 3 — Verify deployment

After deploy, open your app URL and check:

- [ ] Landing page loads (hero slideshow, trending section)
- [ ] `/news` page loads with real articles
- [ ] `/search` — search for a topic, articles appear, generate a report
- [ ] Archive section on landing page shows reports after you generate one
- [ ] Register an account → Login works
- [ ] `/news` → `/trends` → `/search` navigation works

---

## Architecture

```
User browser
    │
    ▼
Vercel Edge / Serverless Functions
    │
    ├── /api/news          → fetches from 30+ RSS + news APIs
    ├── /api/report/*      → AI report generation + archive (Supabase)
    ├── /api/auth/*        → auth (Supabase: users, sessions)
    ├── /api/image-proxy   → server-side image fetch for PDF generation
    └── /api/trending      → Virlo social trends API
    │
    ├── Supabase PostgreSQL
    │       tables: users, sessions, user_api_keys, reports
    │
    └── External APIs
            AI: Groq / Gemini / OpenRouter / Anthropic
            News: GNews, Guardian, NYT, Currents, NewsData, Mediastack, WorldNews, Perigon, GDELT
            Social: Virlo API (trending hashtags)
```

---

## Local Development

```bash
cd newsroom-virlo
npm install
cp .env.example .env.local
# fill in .env.local with your keys
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

> You still need Supabase for local dev (the DB calls hit Supabase over the internet). There is no local SQLite fallback — `better-sqlite3` has been removed.

---

## Database Tables

| Table | Purpose |
|-------|---------|
| `users` | App accounts (email + bcrypt password hash) |
| `sessions` | Session tokens (30-day TTL, stored in httpOnly cookie) |
| `user_api_keys` | Per-user Anthropic API key (optional, session-only display) |
| `reports` | All generated intelligence reports (the archive) |
| `trending_cache` | Single-row Virlo trending cache — persists the 24 h refresh across cold starts |

Schema is in `supabase/schema.sql`. Row Level Security is enabled on all tables — the `service_role` key bypasses it server-side.

---

## Virlo Integration Details

### Landing page trending (server Virlo key)

`VIRLO_API_KEY` in your env powers the landing page trending hashtag section.

**Cache chain (24 h TTL):**
1. In-memory — fastest, survives within same serverless instance
2. Supabase `trending_cache` — persistent across cold starts, checked when memory is stale
3. Live Virlo API call — only when both caches are older than 24 hours

This means the Virlo API is called **at most once per 24 hours**, regardless of traffic.

### Report social intelligence (user's own Virlo key)

Users who connect their own Virlo API key (via the navbar) get a **Social Intelligence tab** added to every report they generate.

- Social signals are fetched from `/api/social` **in parallel** with AI report generation — zero added latency to the report
- Returns YouTube, Instagram, and TikTok trending hashtags for the report topic
- Includes a 2-sentence AI-synthesised **Social Pulse** summary
- The loading screen adds a "Pulling Virlo social signals" step when the key is present

---

## Troubleshooting

### Build fails: `SUPABASE_URL` or `SUPABASE_SERVICE_ROLE_KEY` not defined

Add these to Vercel environment variables and redeploy. The app throws on startup if they are missing.

### Reports not saving to archive

Check that `supabase/schema.sql` was run successfully. Go to Supabase → **Table Editor** and confirm the `reports` table exists.

### News page shows no articles

RSS feeds work without any keys. If even RSS is empty, check the Vercel function logs: **Vercel dashboard → your project → Deployments → Functions tab → /api/news**.

### Auth / login not working

Confirm the `users`, `sessions`, and `user_api_keys` tables exist in Supabase. Also confirm `SUPABASE_SERVICE_ROLE_KEY` is the `service_role` key, not the `anon` key.

### PDF generation opens a blank tab

The PDF is generated client-side with jsPDF. Images in the PDF are fetched via `/api/image-proxy`. This works on Vercel — if blank, check browser console for CORS or fetch errors on the proxy route.

---

## Updating after deployment

Push changes to GitHub — Vercel auto-deploys on every push to `main`.

If you change the database schema:
1. Write migration SQL manually
2. Run it in Supabase SQL Editor
3. Update `supabase/schema.sql` to reflect the new state
