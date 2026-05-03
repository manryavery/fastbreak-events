# Fastbreak Events

A full-stack web app for managing sports events. Users can create events across different sports, attach multiple venues to each event, search by event name, filter by sport type, and edit or delete events at any time. Each event stores a name, sport type, date/time, optional description, and one or more venues with their own names and addresses.

## Live Demo

[I will fill this in with my Vercel URL]

## Tech Stack

- **Next.js 15** (App Router)
- **TypeScript**
- **Supabase** (PostgreSQL)
- **Tailwind CSS**
- **shadcn/ui**
- Deployed on **Vercel**

## Features

- View all sports events on the home page
- Create events with one or more venues
- Edit existing events (add, update, or remove venues)
- Delete events with a confirmation dialog (venues cascade-delete automatically)
- Search events by name
- Filter events by sport type

## Run Locally

```bash
git clone https://github.com/manryavery/fastbreak-events.git
cd fastbreak-events
npm install
```

Create a `.env.local` file in the project root with your Supabase keys:

```
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

Then start the dev server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Architecture

All database operations are handled by Next.js Server Actions, so Supabase credentials and queries stay on the server and never reach the browser.
