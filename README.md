# China Trip Expense Tracker (MVP)

A lightweight, mobile-friendly web app to track shared travel expenses for 3 people (Anna, Husband, Taya) during a China trip. Amounts are entered in **CNY** and shown converted to **VND**.

**Deployed:** everyone uses the same link and sees the same data (Supabase cloud).  
**Local dev:** works without cloud using browser storage as fallback.

## Features

- Add expenses manually (person, CNY amount, optional note)
- Auto CNY → VND conversion (configurable rate)
- Sticky daily summary: budget left, today spent, trip total
- Daily budget resets each calendar day
- **Shared cloud sync** — all devices see the same list
- Trip date range and budget editable in Settings

## Tech stack

- [Next.js 15](https://nextjs.org/) (App Router)
- React 19 + TypeScript + Tailwind CSS
- [Supabase](https://supabase.com) (PostgreSQL) for shared storage
- [Vercel](https://vercel.com) for hosting (recommended)

## Put it on the web (for your group)

See **[DEPLOY.md](./DEPLOY.md)** for step-by-step: Supabase → GitHub → Vercel → share the link.

Quick summary:

1. Run `supabase/schema.sql` in Supabase SQL Editor  
2. Deploy to Vercel with `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`  
3. Share the `*.vercel.app` URL with Anna, Husband, and Taya  

## Run locally

**Requirements:** Node.js 18.18+ (20+ recommended)

```bash
cd /Users/anna/Documents/TravelExpense
npm install
cp .env.example .env.local   # optional: add Supabase keys for shared dev
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Without `.env.local`, data stays on that browser only (offline/demo mode).

## Project structure

```
src/
├── app/
│   ├── api/trip/route.ts   # Shared read/write API
│   ├── page.tsx            # Main expense page
│   └── settings/page.tsx
├── components/
├── hooks/useTravelStore.ts # Cloud sync + polling
├── lib/
│   ├── supabase-admin.ts   # Server-only DB client
│   ├── trip-api.ts         # Client → /api/trip
│   └── calculations.ts
└── types/
supabase/schema.sql         # One-time DB setup
```

## Default settings

| Setting        | Default        |
|----------------|----------------|
| Trip dates     | May 25–31, 2026 |
| Daily budget   | 660 CNY (all 3) |
| Exchange rate  | 1 CNY = 4000 VND |
| People         | Anna, Husband, Taya |

## How sync works

1. Any device **PUTs** full trip state to `/api/trip` after a change (debounced ~400ms).
2. Other devices **GET** every 8 seconds and when the tab regains focus.
3. One row in Supabase (`trip_state`) holds expenses + settings for the whole group.

## Step 2 (planned)

Import expenses from a dedicated Zalo chat (messages + screenshots) using AI parsing.

## License

Private / personal use.
