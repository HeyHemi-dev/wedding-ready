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

### Environment Configuration

- Manage via Vercel dashboard
- Separate configurations for development and production
- Supabase environment variables are automatically injected into the project
