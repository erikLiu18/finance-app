# Personal Finance App

A full-stack web application for tracking income, expenses, and budgets. Built with Next.js, TypeScript, and deployed on Railway.

## 🚀 Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: PostgreSQL (via Railway)
- **Deployment**: Railway

## 📁 Project Structure

```
personal-finance/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   ├── page.tsx           # Home page
│   └── layout.tsx         # Root layout
├── components/            # React components
│   └── ui/                # Reusable UI components
├── lib/                   # Utility functions
│   ├── db/                # Database client & queries
│   ├── types/             # TypeScript type definitions
│   └── utils/             # Helper functions
└── public/                # Static assets
```

## 🛠️ Getting Started

### Prerequisites

- Node.js 20+ (or 22+ recommended)
- npm (or pnpm/yarn)
- Railway CLI (optional, for deployment)

### Local Development

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Set up environment variables**:
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your configuration
   ```

3. **Run the development server**:
   ```bash
   npm run dev
   ```

4. **Open your browser**:
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🚢 Deployment on Railway

1. **Install Railway CLI** (if not already installed):
   ```bash
   npm install -g @railway/cli
   # or
   brew install railway
   ```

2. **Login to Railway**:
   ```bash
   railway login
   ```

3. **Initialize your project**:
   ```bash
   railway init
   # Name your project: personal-finance
   ```

4. **Add PostgreSQL database**:
   ```bash
   railway add postgres
   ```

5. **Deploy**:
   ```bash
   railway up
   ```

6. **Run database migrations** (when you add Prisma/Drizzle):
   ```bash
   railway run npx prisma migrate deploy
   ```

## 📝 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## 🔐 Environment Variables

Create a `.env.local` file with:

```env
# Database (set automatically by Railway)
DATABASE_URL=postgresql://...

# App
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## 📚 Next Steps

- [ ] Set up database schema (Prisma/Drizzle)
- [ ] Add authentication
- [ ] Create transaction tracking
- [ ] Add budget management
- [ ] Implement reporting/analytics

## 📖 Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Railway Documentation](https://docs.railway.app)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
