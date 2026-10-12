# Pixel to Product 2026 — Participation Approval & Attendance Portal

Batch 1 is the project foundation: responsive UI, Supabase client setup, and email/password authentication. Role-based dashboards and database policies are intentionally deferred to later batches so they can be implemented and tested together.

## Requirements

- A Supabase account and project
- A modern browser
- A local static server (do not open `index.html` directly as a `file://` URL)

## 1. Configure Supabase

1. Open your project in the Supabase dashboard.
2. Copy the Project URL and the **publishable** API key.
3. Open `assets/js/config.js` and replace the two placeholders.
4. In Supabase Authentication settings, configure your allowed site URL and redirect URLs for your local development address. For example, if your local server uses `http://localhost:5500`, allow that URL.

Only a publishable key belongs in browser code. Never add a secret/service-role key or database password to this project.

## 2. Run locally

Option A — VS Code Live Server:
1. Install the Live Server extension if you do not already have it.
2. Right-click `index.html`.
3. Choose **Open with Live Server**.

Option B — Python static server, if Python is installed:
1. Open a terminal in this folder.
2. Run `python -m http.server 8000`.
3. Visit `http://localhost:8000`.

## 3. Test Batch 1

- Before configuration, the page should show a setup message when you attempt to sign in.
- After configuration, create a test account using **Create account**.
- If email confirmation is enabled, open the confirmation email before signing in.
- Sign in with the test account, verify the signed-in workspace appears, and test **Sign out**.
- Test **Forgot password?** by entering an email address first.
- Resize the browser to check the responsive layout.

## Important current limitation

The signed-in view is an authentication placeholder, not a completed role dashboard. Do not use this batch for real event approvals or attendance. The next batch adds the PostgreSQL schema, profile roles, and Row Level Security. The three role dashboards will be wired after that schema is in place.

## Suggested two-person workflow

- Teammate A: review `index.html` and `assets/css/styles.css`.
- Teammate B: configure a Supabase development project and review `assets/js/`.
- Agree on changes before merging; keep credentials out of Git history.
