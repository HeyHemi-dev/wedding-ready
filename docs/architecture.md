[ReadMe](/README.md)

# Project Architecture Documentation

## Layered Architecture

| Layer | Responsibility | Implementation |
|-------|---------------|----------------|
| Presentation/UI | UI rendering and layout | - 'Dumb' components |
| Presentation/Client-side Logic | - Animations<br>- State<br>- Data formatting<br> | - Motion<br>- React (state, effects etc.)<br>- Pages |
| Presentation/Client-side Boundary | - UX<br>- Toasts<br>- Zod parsing | - Fetch (inside custom hooks)<br>- Forms |
| Presentation/Server-side Boundary | - Authentication<br>- Headers/cookies<br>- Zod declaration/parsing<br>- UI-type definitions<br>- User-facing errors | - SSR (pages)<br>- API endpoints (routes)<br>- Form actions |
| Operations | - Authorization<br>- Data integrity<br>- Type conversion<br>- Business logic | - Operation Objects (e.g. authOperations, supplierOperations) |
| Data/Access | - CRUD operations | - Models (e.g. supplierModel) |
| Data/Definition | - Data shape definition | - Schema<br>- Constants (e.g. SUPPLIER_ROLES)<br>- Types (e.g. SupplierRaw)<br>- Migrations |

## Implementation Details

### Presentation Layer

#### UI Components
- Organized in `/components/ui`
- Follow atomic design principles
- Context independent
- Uses shadcn/ui with Tailwind CSS
- Use kebab-case for files and directories

#### Functional Components
- Organized in `/components`
- Follow atomic design principles
- Use kebab-case for files and directories

#### Loading States
- Use dedicated loading components for consistent UX
- Implement skeleton loaders for content-heavy pages
- Show loading states during data fetching and mutations
- Use optimistic UI updates to reduce perceived loading time
- Place loading components in `/app/[route]/loading.tsx`
- Reuse loading components across similar layouts

#### Client-Side Data Fetching
- Prefer server-side fetching
- Use React Query (TanStack Query) for client-side data fetching
- Implement custom hooks in `/app/_hooks` for reusable data fetching logic
- Handle loading and error states with proper UI feedback
- Utilize React Query's caching and revalidation features
- Implement optimistic updates for better UX
- Use consistent stale time configuration
- Cache related data for cross-component consistency

#### API Routes
- Organise in `/app/api`
- Implement RESTful endpoints with proper TypeScript types for request/response
- Follow consistent error handling patterns
- Use Zod (co-located) for request validation and parsing

#### Routes
- Organise in `/app`
- Use Next.js pages for navigation
- Use Next.js layouts for consistent page structure
- Implement responsive design patterns
- Separate concerns between layout and content

### Business Logic Layer
- Functions and logic that have utility app-wide (as opposed to the specific context)
- Save in `/app/_actions` for server side functions
- Save in `/app/_hooks` for client side functions
- Save in `/app/_types` for form validation and front-end types

### Operations Layer
- **Purpose**: Orchestrate complex business operations that span multiple models
- **Location**: `/operations/` directory
- **Examples**: `supplierOperations.register()`, `authOperations.signUp()`
- **Responsibilities**:
  - Coordinate multiple model operations
  - Handle business logic and validation
  - Manage transactions and rollbacks
  - Provide high-level API for complex operations

### Data Layer
- Use Drizzle ORM with type-safe schema definitions
- user_details table is used to extend the auth.users table
- **Model Classes**: Implement single-table operations with OOP principles
- **Model Organization**: 
  - Core models: `supplierModel`, `tileModel`, `userModel`
  - Relationship models: `supplierLocationModel`, `supplierServiceModel`, `supplierUserModel`
  - Each model focuses on a single table and its direct operations
- **Optimization**: Make as few database calls as possible, since each query is also a network request to Supabase

### Database Seeding
- **Location**: `src/db/seed.ts`
- **Pattern**: Uses scene-based testing utilities for consistent data setup
- **Benefits**: 
  - Reuses testing infrastructure
  - Ensures seed data follows same patterns as test data
  - Makes seeding more maintainable and testable

