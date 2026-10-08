# Personal Finance Tracker

A full-stack web application for managing personal finances, tracking income and expenses, monitoring accounts and loans, and keeping financial data organized in one place.

**Live Demo:** [fiscora](https://personal-finance-tracker-fawn-eight.vercel.app)

## Features

- User registration and authentication
- JWT-based authentication
- Email verification for personal accounts
  > **Email verification:** The current production setup is intended for personal use. Email verification is configured for the account owner's email address and is not currently intended as a general-purpose email delivery system for arbitrary users.
- Account management
- Income and expense tracking
- Transaction management
- Loan management and loan payments
- Current account and loan balances
- Transaction sources
- Protected API endpoints
- Input validation
- Responsive web interface

## Tech Stack

### Frontend

- Next.js
- React
- TypeScript

### Backend

- NestJS
- TypeScript
- TypeORM
- PostgreSQL
- JWT
- Argon2
- Resend

### Infrastructure

- Supabase — PostgreSQL database
- Render — backend API
- Vercel — frontend
- GitHub — source control and CI/CD

## Project Structure

```text
personal-finance-tracker/
├── api/                    # NestJS backend
│   ├── src/
│   ├── test/
│   └── package.json
│
├── web/                    # Next.js frontend
│   ├── app/
│   ├── components/
│   └── package.json
│
└── README.md
```

## Getting Started

### Prerequisites

Make sure you have the following installed:

- Node.js
- npm
- PostgreSQL

### Clone the repository

```bash
git clone https://github.com/Elin4o/personal-finance-tracker.git
cd personal-finance-tracker
```

## Backend Setup

Navigate to the API directory:

```bash
cd api
npm install
```

Create a `.env` file in the `api` directory and configure the required environment variables.

Example:

```env
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your_password
DB_NAME=personal_finance_tracker

JWT_SECRET=your_secret
RESEND_API_KEY=your_resend_api_key
MAIL_FROM=your_email

NODE_ENV=development
CORS_ORIGIN=http://localhost:3000
APP_URL=http://localhost:3000
```

Run database migrations:

```bash
npm run migration:run
```

Start the development server:

```bash
npm run start:dev
```

The API will be available at:

```text
http://localhost:3001
```

## Frontend Setup

Open another terminal and navigate to the web directory:

```bash
cd web
npm install
```

Create a `.env.local` file:

```env
NEXT_PUBLIC_API_URL=http://localhost:3000
```

Start the development server:

```bash
npm run dev
```

The frontend will be available at:

```text
http://localhost:3000
```

> The exact local ports may differ depending on the configuration of the frontend and backend.

## Database Migrations

The backend uses TypeORM migrations to manage database schema changes.

Generate a new migration after changing the database entities:

```bash
npm run migration:generate -- src/database/migrations/MigrationName
```

Run pending migrations:

```bash
npm run migration:run
```

Revert the most recent migration:

```bash
npm run migration:revert
```

Existing migrations should not be deleted or modified after they have been applied to a production database. Create a new migration for subsequent schema changes.

## Production

The production application is deployed using the following architecture:

```text
                    GitHub
                   /      \
                  /        \
                 ▼          ▼
             Vercel       Render
            Frontend      Backend
                │            │
                │            ▼
                │         Supabase
                │        PostgreSQL
                │
                └─────── API requests
```

### Frontend

The Next.js application is deployed on Vercel.

### Backend

The NestJS API is deployed on Render.

### Database

Production data is stored in PostgreSQL hosted by Supabase.

Environment variables and secrets are configured separately in the respective deployment platforms and are not committed to the repository.

## Deployment Workflow

Production deployments are connected to the GitHub repository.

After making changes locally:

```bash
git add .
git commit -m "Describe your changes"
git push
```

Changes to the frontend are automatically deployed through Vercel.

Changes to the backend are automatically deployed through Render.

Database schema changes require the corresponding TypeORM migration to be applied to the production database.

## Development Workflow

For small changes:

```text
Make changes
     ↓
Test locally
     ↓
Commit
     ↓
Push to GitHub
     ↓
Automatic deployment
```

For larger changes, it is recommended to work on a separate branch and merge the changes into `main` after testing.

## Environment Variables

Environment files containing secrets should never be committed to the repository.

The following files should remain local:

```text
api/.env
web/.env.local
```

Production secrets are configured through Render and Vercel environment settings.

## License

This project is currently private and intended for personal use.
