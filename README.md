# Ivy Africa Tender Portal — Deployment

Everything is built. These are the only steps left, all inside accounts you already have.

## 1. Supabase (data + auth + login logging)

1. Go to your existing project: `vzwojojfbdtjlzijbqyu` (supabase.com/dashboard).
2. Open **SQL Editor → New query**, paste the contents of `supabase-schema.sql`, click **Run**.
3. Go to **Project Settings → API**. Copy the **Project URL** and **anon public key**.
4. Open `index.html` and paste the anon key into `SUPABASE_ANON_KEY` (URL is already filled in).
5. Go to **Authentication → Providers → Email** — turn **on** "Enable Email OTP / Magic Link", turn **off** "Enable email signup" is not needed since RLS already blocks non-`@ivyafrica.co.za` writes, but for extra safety also go to **Authentication → Users** and manually invite each colleague's `@ivyafrica.co.za` email so only real staff can ever sign in.

This gives you: real-time shared data, and a `login_logs` table recording every sign-in with email, timestamp, IP, city, and country — queryable anytime from the Supabase Table Editor or SQL Editor, e.g.:
```sql
select email, city, country, logged_in_at from login_logs order by logged_in_at desc;
```

## 2. Anthropic API key (for document scoring)

You'll need an API key from console.anthropic.com (separate from your claude.ai login — Anthropic's developer console, under **API Keys**). This is what lets colleagues score tender documents from the live site.

## 3. Push to GitHub

```bash
cd tender-portal
git init
git add .
git commit -m "Ivy Africa Tender Portal"
gh repo create dmakhoali-beep/ivy-africa-tender-portal --public --source=. --push
```
(If you don't have `gh` CLI, create the repo manually on github.com under the same account you use for `dmakhoali-beep`, then `git remote add origin <url>` and `git push -u origin main`.)

## 4. Netlify

1. Netlify dashboard → **Add new site → Import an existing project** → pick the new GitHub repo.
2. Build settings: leave publish directory as `.` (already set in `netlify.toml`).
3. Go to **Site settings → Environment variables**, add:
   - `ANTHROPIC_API_KEY` = your key from step 2.
4. Deploy. Netlify gives you a URL like `ivy-africa-tender-portal.netlify.app` — you can rename it in **Site settings → Change site name**, or point your own domain at it later.

## 5. Install as a phone app

Once live, each colleague opens the Netlify URL on their phone:
- **iPhone (Safari):** Share icon → "Add to Home Screen"
- **Android (Chrome):** ⋮ menu → "Install app" / "Add to Home screen"

It then behaves like a real app icon, opens full-screen, and stays live-synced with everyone else through Supabase realtime — no App Store submission needed.

## What's already built and working once the above is done
- Magic-link sign-in restricted to `@ivyafrica.co.za`
- Every login logged with device, IP, city, country
- Shared, real-time tender board (submitted/pipeline/won/lost/missed)
- R10M monthly goal bar + 5-tenders/working-day cadence tracker
- Upload/paste a tender doc → PFMA-style functionality scoring + GO/SELECTIVE/AVOID verdict
- One-click daily/weekly downloadable reports
- Installable on phones as a PWA
