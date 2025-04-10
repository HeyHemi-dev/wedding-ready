[ReadMe](/README.md)

# Project Architecture Documentation

Layered architecture pattern

### Database Layer

- Use Drizzle ORM with type-safe schema definitions
- user_details table is used to extend the auth.users table
- Implement Model classes with OOP principals for database operations
- Optimise database queries to make as few calls as possible, since each query is a also a network request to Supabase

### Business Logic Layer

- functions and logic that have utility app-wide (as opposed to the specific context)
- Save in `/actions` for server side functions
- Save in `/hooks` for client side functions

### Presentation Layer

1. **Routes**

   - Organise in `/app`
   - Use Next.js pages for navigation
   - Use Next.js layouts for consistent page structure
   - Implement responsive design patterns
   - Separate concerns between layout and content

2. **API Routes**

   - Organise in `/app/api`
   - Implement RESTful endpoints with proper TypeScript types for request/response
   - Follow consistent error handling patterns
   - Use Zod (co-located) for request validation and parsing

3. **Client-Side Data Fetching**

   - Prefer server-side fetching
   - Use React Query (TanStack Query) for client-side data fetching
   - Implement custom hooks in `/hooks` for reusable data fetching logic
   - Handle loading and error states with proper UI feedback
   - Utilize React Query's caching and revalidation features
   - Implement optimistic updates for better UX
   - Use consistent stale time configuration
   - Cache related data for cross-component consistency

4. **Loading States**

   - Use dedicated loading components for consistent UX
   - Implement skeleton loaders for content-heavy pages
   - Show loading states during data fetching and mutations
   - Use optimistic UI updates to reduce perceived loading time
   - Place loading components in `/app/[route]/loading.tsx`
   - Reuse loading components across similar layouts

5. **Functional Components**

   - Organized in `/components`
   - Follow atomic design principles

6. **UI Components**
   - Organized in `/components/ui`
   - Follow atomic design principles
   - Context independent
   - Uses shadcn/ui with Tailwind CSS
