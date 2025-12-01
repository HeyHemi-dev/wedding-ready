[ReadMe](/README.md)

# Development Patterns

### Actions/Models/Operations

- **Models**: Inferred models for each database table with single-table operations
- **Operations**: Business logic orchestration that coordinates multiple models
- **Model Classes**: Focus on single-table operations (e.g., `supplierModel`, `supplierLocationModel`)
- **Operations Layer**: Handle complex business logic spanning multiple models (e.g., `supplierOperations.register()`)

### Data Fetching

- Use custom hooks for data fetching logic
- Follow React Query patterns for caching and revalidation
- Implement proper error boundaries and loading states. Do not use Suspense
- Keep query keys consistent and well-typed
- Use optimistic updates for better UX when appropriate
- When fetching an array of tiles, set saveState cache using React Query's queryClient
- Use optimistic updates with React Query for immediate UI feedback

### Environment Configuration

- Manage via Vercel dashboard
- Separate configurations for development and production
- Supabase environment variables are automatically injected into the project

### Const Object Handling

- Use `const-helpers.ts` utilities for consistent const object handling
- Convert between URL parameters and const values using `paramToConst`
- Format const values for display using `valueToPretty`
- Use specialized helpers: `locationHelpers`, `serviceHelpers`, `supplierRoleHelpers`

### Forms

- Follow the form validation pattern in [form-patterns.md](./form-patterns.md)
- Use Zod schemas for type-safe validation
- Use react-hook-forms and onSubmit to trigger server actions
- Use Shadcn form components with our custom `FormFieldItem`
- Keep form actions co-located with form components

### Responsive Design

- Use mobile-first approach with Tailwind's responsive prefixes (tablet:, laptop:, wide:). Default styles apply to mobile first, and override as needed for larger break points
- Follow consistent spacing using our design tokens (gap-area, gap-sibling, etc.)
- Use CSS Grid for complex layouts with responsive breakpoints

### Error Handling

- Use consistent error constants from `@/app/_types/errors.ts`
- Implement proper error boundaries for components
- Use `tryCatch` utility for consistent error handling patterns
- Handle both user-facing and system errors appropriately
