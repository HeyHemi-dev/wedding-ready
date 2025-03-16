# Project Architecture Documentation

## Architecture

Layered Architecture

### Database Layer
- Uses Drizzle ORM with type-safe schema definitions
- user_details table is used to extend the auth.users table
- Implements Model classes with OOP principals for database operations
- Optimise database queries to make as few calls as possible, since each query is a also a network request to Supabase


### Business Logic Layer
- functions and logic that have utility app-wide (as opposed to the specific context)
- Save in `/actions` for server side functions
- Save in `/hooks` for client side functions

### Presentation Layer
1. **Routes**
   - Organized in `/app`
   - Uses Next.js routes for navigation
   - Uses Next.js layouts for consistent page structure
   - Implements responsive design patterns
   - Separates concerns between layout and content

2. **API Routes**
   - Organised in `/app/api`
   - Fetch with useQuery.

3. **Functional Components**
   - Organized in `/components`
   - Follows atomic design principles

4. **UI Components**
   - Organized in `/components/ui`
   - Follows atomic design principles
   - Context independent
   - Uses shadcn/ui with Tailwind CSS
  
## Authentication Flow
The project uses Supabase Auth with a sophisticated server-side implementation:

1. **Server-Side Auth**: Implemented using Supabase SSR client
2. **Protected Routes**: Middleware handles auth protection
3. **Session Management**: Automatic session refresh and cookie handling

## Development Patterns

### Type Safety
- Strong TypeScript implementation throughout
- Strict type checking enabled
- ESLint with Next.js TypeScript rules for enhanced type checking
- Model type naming: 
   - `[model]` e.g. `Tile` shape of data with the most common fields needed for the presentation layer. Usually constructured from several table joins. Must only be used server-side
   - `[model]Safe` e.g. `TileSafe` shape of data with only the fields that are safe to send to the client.
   - `[model]Raw` e.g. `TileRaw` shape of data directly from a row in a table.
   - `Insert[model]Raw` e.g. `InsertTileRaw` shape of data for creating a row in a table.
   - `SetModelRaw` e.g. `SetTileRaw` shape of data for updating a row in a table. Removes fields that should not be updated (e.g. 'id', createdAt etc.)
- API type naming: 
   - `[endpoint]RequestBody` e.g. `createTileRequestBody`
   - `[endpoint]ResponseBody` e.g. `createTileResponseBody`

### Forms
- Use server actions where possible instead of onSubmit
- Tanstack Form
- Zod validation

### Actions/Models
- Inferred models for each database table
- Action classes for operations on each database table

### Server/Client Separation
- Server components where possible for reduced client-side JavaScript
- Clear separation between server and client components
- Hooks for both contexts
- Server actions for data mutations

### Environment Configuration
- Manage via Vercel dashboard
- Separate configurations for development and production
- Supabase environment variables are automatically injected into the project
