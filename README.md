# OrgAdmin — Admin Dashboard

A production-minded admin dashboard for creating and managing organizations and their members, built with React 18 + Supabase.

**Live URLs**
- Production: *(add Vercel production URL here — deployed from `main`)*
- Development preview: *(add Vercel preview URL here — deployed from `development`)*

---

## Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + TypeScript (strict) + Vite (SWC) |
| Routing | React Router v6 |
| Styling | Tailwind CSS v4 + shadcn/ui (Radix) |
| Server state | TanStack React Query v5 |
| Forms | React Hook Form + Zod |
| Icons | Lucide React |
| Dark mode | next-themes |
| Backend | Supabase (Postgres + Auth + Edge Functions) |
| Deployment | Vercel |

---

## Local Setup (< 15 min)

### Prerequisites
- Node.js >= 18
- A free [Supabase](https://supabase.com) project

### 1. Clone & install

```bash
git clone <repo-url>
cd orgadmin
npm install
```

### 2. Create your env file

```bash
cp .env.example .env.local
```

Fill in `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` from your Supabase project's **Project Settings > API** page.

### 3. Run the database migration

In the Supabase SQL editor, paste and run:

```
supabase/migrations/001_initial_schema.sql
```

This creates `profiles`, `organizations`, and `organization_members` tables with all foreign keys, constraints, and RLS policies.

### 4. Deploy Edge Functions

```bash
npx supabase functions deploy invite-member
```

The `SUPABASE_SERVICE_ROLE_KEY` is available as a built-in environment variable inside all Edge Functions.

### 5. Start the dev server

```bash
npm run dev
```

Visit `http://localhost:5173`. Sign up with any email/password to create an admin account.

---

## Seeded Test Credentials

| Field | Value |
|---|---|
| Email | `admin@orgadmin.dev` |
| Password | `AdminTest123!` |

*(Create via the Sign Up page on the live deployment, or use any email/password.)*

---

## Branching Strategy

```
main          <- production  (auto-deploys to Vercel Production)
development   <- default     (auto-deploys to Vercel Preview)
feature/*     <- short-lived branches off development
```

Feature branches merge into `development` via pull request. Once stable, `development` merges into `main`.

---

## Architecture Decisions & Tradeoffs

### Auth model
All sign-ups create admin accounts. A real product would gate sign-up with an invite or check `is_admin` server-side before granting dashboard access.

### Edge Function for invitations
`invite-member` runs server-side to: (1) verify caller owns the org, (2) prevent duplicate invites enforced at the DB level, and (3) keep the service-role key off the client bundle. Email delivery is stubbed — a comment marks where Resend/SendGrid would plug in.

### Type-specific fields
Stored as nullable columns (`school_district`, `tax_id`, `industry`) rather than a JSONB blob — more queryable and index-friendly for a fixed set of types.

### RLS
Every table has RLS enabled. Org rows are scoped by `created_by = auth.uid()`. Member rows are scoped via a subquery that checks org ownership.

### What I'd do with another day
- Accept-invitation flow: click link -> sign up -> link `user_id` on member row
- Role-based views within an org (admin vs member)
- Search/filter on the directory page
- Playwright e2e test covering the full flow
- Separate Supabase projects for dev vs prod

### Shortcuts taken
- No actual email delivery (invitation record created, send step stubbed)
- No pagination (demo-scale data)
- No RBAC beyond the org-owner check
