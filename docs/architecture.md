[ReadMe](/README.md)

# Project Architecture Documentation
Layered architecture pattern

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
  



