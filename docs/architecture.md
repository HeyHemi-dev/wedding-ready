# Project Architecture Documentation

## Key Architectural Patterns

### Authentication Flow
The project uses Supabase Auth with a sophisticated server-side implementation:

1. **Server-Side Auth**: Implemented using Supabase SSR client
2. **Protected Routes**: Middleware handles auth protection
3. **Session Management**: Automatic session refresh and cookie handling

### Database Layer
- Uses Drizzle ORM with type-safe schema definitions
- Implements action classes for database operations
- Clear separation between database schema and business logic
- User_details table is used to extend the auth.users table

### Component Architecture
1. **Routes**
   - Organized in `/app`
   - Uses Next.js routes for navigation
   - Uses Next.js layouts for consistent page structure
   - Implements responsive design patterns
   - Separates concerns between layout and content

2. **Functional Components**
   - Organized in `/components`
   - Follows atomic design principles

3. **UI Components**
   - Organized in `/components/ui`
   - Follows atomic design principles
   - Context independent
   - Uses shadcn/ui with Tailwind CSS

## Development Patterns

### 1. Type Safety
- Strong TypeScript implementation throughout
- Type definitions for database models
- Strict type checking enabled

### 2. Actions/Models
- Inferred models for each database table
- Action classes for operations on each database table

### 3. Server/Client Separation
- Clear separation between server and client components
- Server components where possible for reduced client-side JavaScript
- Custom hooks for both contexts
- Server actions for data mutations

### 4. Environment Configuration
- Manage via Vercel dashboard
- Separate configurations for development and production
- Supabase environment variables are automatically injected into the project
