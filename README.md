# Physics Learning App - Local Development Setup

A full-stack application for learning Newton's Laws of Motion with interactive examples and AI-powered feedback.

## Prerequisites

- Node.js 18+ 
- PostgreSQL 12+
- Git

## Local Setup Instructions

### 1. Clone and Install Dependencies

```bash
git clone <your-repo-url>
cd physics-app
npm install
```

### 2. Database Setup

**Install PostgreSQL locally:**

*macOS (using Homebrew):*
```bash
brew install postgresql@14
brew services start postgresql@14
```

*Ubuntu/Debian:*
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

*Windows:*
Download and install from [postgresql.org](https://www.postgresql.org/download/windows/)

**Create local database:**
```bash
# Connect to PostgreSQL (may need sudo -u postgres psql on Linux)
psql postgres

# Create database and user
CREATE DATABASE physics_app;
CREATE USER physics_user WITH ENCRYPTED PASSWORD 'physics_dev_2024';
GRANT ALL PRIVILEGES ON DATABASE physics_app TO physics_user;

# Grant schema permissions
\c physics_app;
GRANT ALL ON SCHEMA public TO physics_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO physics_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO physics_user;

\q
```

### 3. Environment Configuration

Copy the example environment file:
```bash
cp .env.local .env
```

Update `.env` with your local database connection:
```
DATABASE_URL=postgresql://physics_user:your_password@localhost:5432/physics_app
SESSION_SECRET=your_secure_random_string_here
NODE_ENV=development

# Optional: For AI grading features
OPENAI_API_KEY=your_openai_api_key_here
```

### 4. Initialize Database

```bash
# Push schema to local database
npx drizzle-kit push --config=drizzle.config.local.ts

# Initialize with lesson data
node --loader tsx --env-file=.env scripts/init-local-db.js
```

### 5. Start Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:5000`

## Local vs Replit Environment

The project automatically detects whether you're running locally or on Replit:

- **Local**: Uses standard PostgreSQL with `pg` driver
- **Replit**: Uses Neon serverless PostgreSQL

### For Local Development Only

If you want to run purely with local PostgreSQL (bypassing Neon dependencies), you can:

1. Replace the database connection in `server/db.ts` with the contents of `server/db-local.ts`
2. Use `drizzle.config.local.ts` for all database operations

## Project Structure

```
├── client/              # React frontend
│   ├── src/
│   │   ├── components/  # Reusable UI components
│   │   ├── pages/       # Application pages
│   │   ├── hooks/       # Custom React hooks
│   │   └── lib/         # Utilities and constants
├── server/              # Express backend
│   ├── routes.ts        # API routes
│   ├── storage.ts       # Database layer
│   └── services/        # External services (OpenAI)
├── shared/              # Shared types and schemas
│   └── schema.ts        # Database schema and types
└── package.json
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run db:push` - Push schema changes to database
- `npm run db:studio` - Open database studio (if available)

## Features

- User authentication and registration
- Interactive physics lessons for Newton's Laws
- Student example submission system
- AI-powered grading and feedback (requires OpenAI API key)
- Progress tracking across lessons

## Troubleshooting Local Development

### Common Issues

**Database Connection Errors:**
```bash
# Check if PostgreSQL is running
brew services list | grep postgresql  # macOS
sudo systemctl status postgresql      # Linux

# Test database connection
psql postgresql://physics_user:physics_dev_2024@localhost:5432/physics_app
```

**Port Already in Use:**
```bash
# Find process using port 5000
lsof -i :5000
# Kill the process if needed
kill -9 <PID>
```

**Permission Errors (Linux):**
```bash
# If you get permission errors with PostgreSQL
sudo -u postgres createdb physics_app
sudo -u postgres createuser physics_user
sudo -u postgres psql -c "ALTER USER physics_user WITH PASSWORD 'physics_dev_2024';"
```

**Node.js Version Issues:**
- Ensure you're using Node.js 18 or higher
- Use nvm to manage Node versions: `nvm use 18`

### Development Workflow

1. Make code changes
2. Server automatically restarts (thanks to tsx)
3. Frontend hot-reloads automatically
4. Database changes require `npm run db:push`

### VS Code Setup

The project includes VS Code configuration for:
- Tailwind CSS IntelliSense
- TypeScript support
- Auto-formatting with Prettier
- PostgreSQL database management

## Development Notes

- Frontend uses React with Wouter for routing
- Backend uses Express with PostgreSQL via Drizzle ORM
- Styling with Tailwind CSS and shadcn/ui components
- Real-time updates with React Query for state management
- Authentication handled with Passport.js local strategy
- Session storage in PostgreSQL with connect-pg-simple
