# LawnTracker

LawnTracker is a responsive client and job scheduling app for independent lawn-care businesses. It keeps customer details, scheduled work, prices, completion status, and payment status in one focused workspace that works well on desktop and mobile.

## Features

- Supabase email/password authentication with password reset
- Dashboard for today’s jobs and the next seven days
- Client directory with contact details, pricing, notes, and CRUD actions
- Monthly schedule with desktop and mobile calendar layouts
- Job creation and editing with client, date, price, notes, completion, and payment tracking
- Responsive UI with mobile navigation and touch-friendly controls
- Docker image for deployment behind an Nginx reverse proxy

## Technology

- React 19 + TypeScript + Vite
- Tailwind CSS 4
- Supabase Auth and Postgres database
- Docker, Docker Compose, and Nginx

## Local setup

### Prerequisites

- Node.js 24 or newer
- npm
- A Supabase project with email/password authentication enabled

### Configure the environment

Copy `.env.example` to `.env.local` and fill in the values for your Supabase project:

```text
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-publishable-key
```

These are Vite client-side variables. Use only Supabase’s publishable/anon key here. Never put a Supabase service-role key, database password, or other server secret in this project or any `VITE_*` variable.

The repository ignores `.env`, `.env.*`, and other local environment files while keeping `.env.example` tracked. Supabase CLI metadata under `supabase/.temp/` is also local-only.

### Install and run

```bash
npm install
npm run dev
```

Vite prints the local development URL when the server starts.

## Database setup

The SQL migrations in [`supabase/migrations`](supabase/migrations) create the `clients` and `jobs` tables, indexes, and row-level security policies.

The second migration prepares a shared-workspace model without moving or deleting existing rows. It adds `workspaces`, `workspace_members`, and nullable `workspace_id` columns, while leaving the current policies unchanged until both accounts have been added to a workspace and existing rows have been assigned to it. The final activation step should replace the broad policies with membership-based RLS; do not leave `using (true)` or `with check (true)` in a multi-user deployment.

## Available scripts

```bash
npm run dev       # Start Vite in development mode
npm run build     # Type-check and create a production build
npm run lint      # Lint application source files
npm run preview   # Preview the production build locally
```

There are currently no automated test scripts; adding focused component and integration tests is a planned improvement.

## Docker deployment

The included `Dockerfile` builds the Vite app and serves the static output with Nginx. Docker Compose passes the two public Supabase values as build arguments:

```bash
docker network create net-proxy  # only needed once when using the default compose file
docker compose --env-file .env.local up --build -d
```

The default Compose file joins an external `net-proxy` network so an existing reverse proxy can route traffic to the `lawn-tracker` container. For a standalone local container, expose port 80 in a local Compose override or run the image with `-p 8080:80`.
