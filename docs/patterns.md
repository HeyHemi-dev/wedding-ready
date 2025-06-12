[ReadMe](/README.md)

# Development Patterns

### Actions/Models

- Inferred models for each database table.
- Model classes for operations on each database table.

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

### Enum Handling

- Use `enum-helpers.ts` utilities for consistent enum handling
- Convert between URL parameters and enum values using `paramToEnum`
- Format enum values for display using `valueToPretty`

### Forms

- Follow the form validation pattern in [patterns-form.md](./patterns-form.md)
- Use Zod schemas for type-safe validation
- Use react-hook-forms and onSubmit to trigger server actions
- Use Shadcn form components with our custom `FormFieldItem`
- Keep form actions co-located with form components

### Responsive Design

- Use mobile-first approach with Tailwind's responsive prefixes (tablet:, laptop:, wide:). Default styles apply to mobile first, and override as needed for larger break points
- Follow consistent spacing using our design tokens (gap-area, gap-sibling, etc.)
- Use CSS Grid for complex layouts with responsive breakpoints
