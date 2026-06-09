# Setup Instructions

## Quick Start

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   - Copy `.env.local.example` to `.env.local`
   - Fill in your Supabase URL, keys, and database connection string

3. **Set up the database:**
   ```bash
   # Generate Prisma Client
   npm run db:generate
   
   # Push schema to database (development)
   npm run db:push
   ```

4. **Run the development server:**
   ```bash
   npm run dev
   ```

## Environment Variables Required

### Database (PostgreSQL via Supabase)
- `DATABASE_URL` - Supabase PostgreSQL connection string

### Supabase Authentication & Storage
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key (for client-side)
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key (for server-side, optional)

## Database Setup

### Option 1: Local PostgreSQL
1. Install PostgreSQL
2. Create a database: `createdb autobuy_electronics`
3. Set `DATABASE_URL` in `.env.local`

### Option 2: Supabase
1. Create a Supabase project
2. Copy the connection string from project settings
3. Set `DATABASE_URL` in `.env.local`

### Option 3: Neon
1. Create a Neon project
2. Copy the connection string
3. Set `DATABASE_URL` in `.env.local`

## Supabase Setup

1. Create a Supabase account at https://supabase.com
2. Create a new project
3. Get your project URL and API keys from Settings → API
4. Get your database connection string from Settings → Database
5. Enable email authentication in Authentication → Providers → Email

## Project Structure

- `app/` - Next.js App Router pages and API routes
- `components/` - React components (shadcn/ui components go in `components/ui/`)
- `lib/` - Utility functions and shared code
- `prisma/` - Database schema and migrations
- `types/` - TypeScript type definitions

## Next Steps

1. Implement the recommendation engine
2. Implement the compatibility checker
3. Implement Playwright automation for mocked checkout
4. Build the UI components using shadcn/ui
5. Add system profile management UI
6. Add purchase flow UI
