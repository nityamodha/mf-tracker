# MF Ops Tracker

Operational command center for mutual fund distribution servicing workflows. The app is built for relationship managers, mid-office teams, and admins handling SIP operations, KYC servicing, folio changes, AMC coordination, RTA follow-up, and related transaction requests.

## Stack

- Next.js 15 App Router
- TypeScript strict mode
- Tailwind CSS
- shadcn-style UI components in-repo
- TanStack Table
- DnD Kit
- Recharts
- Supabase Postgres, Storage
- Vercel deployment target

## What’s Included

- Simple internal email/password login backed by `public.users`
- Role-based app shell for `admin`, `rm`, and `mid_office`
- Dashboard with KPI cards, charts, recent tasks, and overdue tasks
- Task table with search, sorting, pagination, and bulk status updates
- Kanban board with drag-drop workflow lanes and realtime refresh
- Task detail command view with comments, attachments, controls, and audit trail
- Admin-only user management with manual password creation
- SQL migration with enums, triggers, ticket numbering, RLS, storage bucket, and realtime tables
- Seed SQL for AMC and task type lookup data

## Environment Variables

Copy `.env.example` to `.env.local` and set:

```bash
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
```

## Local Development

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Supabase Setup

1. Create a new Supabase project.
2. Enable Email/Password in Auth providers.
3. Run the SQL migration in `supabase/migrations/20260511100000_initial_schema.sql`.
4. If you started from the earlier auth-based version, also run `supabase/migrations/20260511103000_simplify_auth.sql`.
5. Run the seed script in `supabase/seed/seed.sql`.
6. Insert your first admin row into `public.users`.

Example admin user:

```sql
insert into public.users (full_name, email, password, role, team, is_active)
values ('Admin User', 'admin@company.com', 'change-me-now', 'admin', 'Operations', true);
```

## Deployment on Vercel

1. Import the repository into Vercel.
2. Add the same three environment variables in the Vercel project.
3. Deploy with the default Next.js preset.
4. Point the app at your Supabase project URL and keys.

## Notes

- Attachments are stored in the private Supabase storage bucket `task-attachments` and served via signed URLs.
- The app now uses a lightweight app cookie session instead of Supabase Auth.
- The service role key is used server-side for user CRUD, attachments, and app data access.
