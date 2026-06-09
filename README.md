# AutoBuy Electronics

**An AI that guarantees PC part compatibility and safely buys for you.**

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm
- PostgreSQL database (Supabase recommended - includes auth)
- Supabase account (for authentication and storage)

### Installation

1. **Clone the repository and install dependencies:**

```bash
cd autobuy-electronics
npm install
```

2. **Set up environment variables:**

Copy `.env.local.example` to `.env.local` and fill in your credentials:

```bash
# Database (Supabase connection string)
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT].supabase.co:5432/postgres"

# Supabase Authentication & Storage
NEXT_PUBLIC_SUPABASE_URL=https://[YOUR-PROJECT].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

3. **Set up the database:**

```bash
# Generate Prisma Client
npm run db:generate

# Push schema to database (development)
npm run db:push

# Or run migrations (production)
npm run db:migrate
```

4. **Run the development server:**

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📁 Project Structure

```
autobuy-electronics/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   │   ├── auth/          # Clerk auth handlers
│   │   ├── system/        # System profile endpoints
│   │   ├── recommendations/  # Recommendation engine
│   │   ├── compatibility/    # Compatibility checker
│   │   └── purchase/         # Purchase flow
│   ├── (auth)/            # Auth pages (sign-in, sign-up)
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/            # React components
│   └── ui/               # shadcn/ui components
├── lib/                  # Utilities and shared code
│   ├── auth.ts           # Authentication helpers
│   ├── prisma.ts         # Prisma client
│   └── utils.ts          # Utility functions
├── prisma/               # Database schema
│   └── schema.prisma     # Prisma schema
├── types/                # TypeScript type definitions
│   └── index.ts          # Shared types
└── hooks/                # React hooks
```

## 🛠️ Technology Stack

- **Frontend:** Next.js 14 (App Router), TypeScript, Tailwind CSS, shadcn/ui
- **Authentication:** Supabase Auth
- **Database:** PostgreSQL with Prisma ORM (via Supabase)
- **Storage:** Supabase Storage (for receipts)
- **Automation:** Playwright (for mocked checkout in v1)

## 📋 Core Features (v1)

- ✅ User authentication (Supabase Auth)
- ✅ System profile management
- ✅ Component compatibility checking (placeholder)
- ✅ Purchase flow with approval workflow
- ✅ Mocked purchase execution
- ⏳ Recommendation engine (placeholder)
- ⏳ Playwright automation (placeholder)

## 🚧 Development Status

This is a v1 implementation with the following characteristics:

- **Mocked Checkout:** Purchase execution is mocked in v1
- **Placeholder Engines:** Recommendation and compatibility engines have placeholder implementations
- **No Background Workers:** All processing is synchronous in v1
- **Basic UI:** Minimal UI implementation for core flows

## 📝 API Endpoints

### System
- `GET /api/system/profile` - Get user's system profile
- `POST /api/system/profile` - Create/update system profile
- `GET /api/system/components` - List user's current components

### Recommendations
- `POST /api/recommendations` - Get recommendations for component type

### Compatibility
- `POST /api/compatibility/check` - Check component compatibility

### Purchase
- `POST /api/purchase` - Initiate purchase flow
- `POST /api/purchase/approve` - Approve purchase
- `GET /api/purchase/:id` - Get purchase status
- `POST /api/purchase/execute` - Execute mocked purchase (v1)

## 🔐 Environment Variables

See `.env.example` for required environment variables.

## 📚 Documentation

See [PRD.md](../PRD.md) for the complete Product Requirements Document.

## 🤝 Contributing

This is a private project. Development is currently in progress for v1.

## 📄 License

Private project - All rights reserved.
