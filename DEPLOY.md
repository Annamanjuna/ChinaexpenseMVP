# Deploy online (shared for everyone on the trip)

Deploy to **Vercel** (free) + **Supabase** (free) so Anna, Husband, and Taya open the **same URL** and see the **same expenses**.

## 1. Supabase (shared database)

1. Go to [supabase.com](https://supabase.com) → **New project** (free tier).
2. Open **SQL Editor** → paste and run `supabase/schema.sql` from this repo.
3. Go to **Project Settings → API** and copy:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **service_role** key (secret) → `SUPABASE_SERVICE_ROLE_KEY`  
     Never put the service role key in client code or GitHub — only in Vercel env vars.

## 2. Push code to GitHub

```bash
cd /Users/anna/Documents/TravelExpense
git init
git add .
git commit -m "Travel expense tracker with cloud sync"
```

Create a repo on GitHub and push (or use GitHub Desktop).

## 3. Deploy on Vercel

1. Go to [vercel.com](https://vercel.com) → **Add New → Project** → import your GitHub repo.
2. Framework: **Next.js** (auto-detected).
3. **Environment variables** (Production):

   | Name | Value |
   |------|--------|
   | `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL |
   | `SUPABASE_SERVICE_ROLE_KEY` | service_role key from Supabase |
   | `TRIP_STATE_ID` | `china-2026` (optional, default) |

4. Click **Deploy**.

5. Copy your live URL, e.g. `https://travel-expense-xxx.vercel.app` — share it with the group.

## 4. Local dev with cloud (optional)

```bash
cp .env.example .env.local
# Fill in Supabase values
npm run dev
```

Without `.env.local`, the app falls back to **localStorage** on that device only (for testing UI).

## 5. Optional: protect writes

If the URL is public, set `TRIP_WRITE_SECRET` in Vercel to a long random string.  
(Advanced: wire the client to send `x-trip-secret` — for a family trip, a private link is usually enough.)

## Checklist

- [ ] SQL schema run in Supabase
- [ ] Env vars set on Vercel
- [ ] Deploy succeeded
- [ ] Open URL on two phones → add expense on one → appears on the other within ~8 seconds (or when switching back to the tab)

## Troubleshooting

| Problem | Fix |
|---------|-----|
| Yellow bar “Chỉ lưu trên máy này” | Add Supabase env vars and redeploy |
| 500 on `/api/trip` | Check service role key; confirm `trip_state` table exists |
| Changes not showing on other phone | Wait for poll (~8s) or switch away and back to the tab |
