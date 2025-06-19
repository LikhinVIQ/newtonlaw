# Newton's Laws Learning Platform

## Overview

This is a modern, interactive web application designed to teach Newton's Three Laws of Motion through hands-on examples and AI-powered feedback. Students learn by creating their own physics examples and receiving personalized grading and feedback from OpenAI's GPT-4o model.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query (React Query) for server state management
- **Styling**: Tailwind CSS with shadcn/ui component library
- **Build Tool**: Vite for fast development and optimized builds
- **UI Components**: Radix UI primitives with custom theming

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **API Pattern**: RESTful API with JSON responses
- **Development Server**: Hot reload with Vite middleware integration
- **Error Handling**: Centralized error middleware with structured responses

### Data Storage Solutions
- **Database**: PostgreSQL with Neon serverless database
- **ORM**: Drizzle ORM for type-safe database operations
- **Schema Management**: Drizzle Kit for migrations and schema management
- **Storage Implementation**: In-memory storage for development with interface for easy database migration

## Key Components

### Database Schema
- **Lessons Table**: Stores Newton's law lessons with theory, examples, and completion status
- **Submissions Table**: Stores student submissions with AI grading results and feedback
- **Validation**: Zod schemas for runtime type validation and form validation

### AI Integration
- **Service**: OpenAI GPT-4o integration for physics example grading
- **Grading Criteria**: Evaluates accuracy, clarity, force identification, and explanation quality
- **Feedback Structure**: Structured JSON response with scores, strengths, improvements, and comments

### User Interface Components
- **Navigation**: Sticky header with lesson progress tracking
- **Progress Stepper**: Visual progress indicator across all three laws
- **Lesson Content**: Tabbed interface for theory, examples, and practice
- **Student Form**: React Hook Form with Zod validation for submission creation
- **Feedback Display**: Detailed AI feedback presentation with visual scoring

## Data Flow

1. **Lesson Loading**: Client fetches lessons from `/api/lessons` endpoint
2. **Lesson Navigation**: Users navigate between theory, examples, and practice tabs
3. **Submission Creation**: Students fill out forms to create physics examples
4. **AI Grading**: Backend sends submissions to OpenAI for evaluation
5. **Feedback Display**: Graded submissions with detailed feedback are shown to users
6. **Progress Tracking**: Lesson completion status is updated and reflected in navigation

## External Dependencies

### Core Dependencies
- **Database**: @neondatabase/serverless for PostgreSQL connection
- **AI Service**: OpenAI API for automated grading
- **UI Library**: Extensive shadcn/ui component library built on Radix UI
- **Form Handling**: React Hook Form with Hookform Resolvers for validation
- **State Management**: TanStack React Query for server state

### Development Tools
- **Build**: Vite with React plugin and TypeScript support
- **Styling**: Tailwind CSS with PostCSS processing
- **Type Safety**: TypeScript with strict configuration
- **Code Quality**: ESLint configuration (implied by component structure)

## Deployment Strategy

### Build Process
- **Frontend**: Vite builds optimized static assets to `dist/public`
- **Backend**: ESBuild bundles server code for Node.js production
- **Assets**: Static files served from build output directory

### Environment Configuration
- **Development**: Hot reload with Vite dev server on port 5000
- **Production**: Express server serves built static files and API
- **Database**: Environment variable configuration for database connection
- **AI Service**: OpenAI API key configuration through environment variables

### Platform Integration
- **Replit**: Configured for autoscale deployment with proper port mapping
- **Modules**: Node.js 20, web server, and PostgreSQL 16 support
- **Workflows**: Automated development workflow with hot reload

## Recent Changes

- **June 19, 2025**: Fixed student form to dynamically update based on Newton's law being studied
  - First Law: Focus on object state and inertia effects
  - Second Law: Focus on force application and resulting motion
  - Third Law: Focus on action-reaction force pairs
- **June 19, 2025**: Initial setup of Newton's Laws learning platform with AI grading

## User Preferences

```
Preferred communication style: Simple, everyday language.
```