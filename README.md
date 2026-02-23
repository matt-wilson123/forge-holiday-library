## Books by Forge – Setup

This repo contains a Next.js App Router project for the **Books by Forge** office library web app.

### 1. Install dependencies

In the project root (`Books by Forge`), run:

```bash
npm install
```

If you prefer `pnpm` or `yarn`, adjust accordingly.

### 2. Run the dev server

```bash
npm run dev
```

Then open `http://localhost:3000` in your browser.

### 3. Environment variables

Create a `.env.local` file in the project root with:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

The service role key is only used on the server (API routes / server components) and must **never** be exposed to the client.

### 4. Supabase schema

There will be SQL files under `supabase/` (to be added) defining:

- `books`
- `colleagues`
- `loans`

Apply them in your Supabase project, then seed with a handful of sample books.

