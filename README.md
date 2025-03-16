# WeddingReady

WeddingReady is a platform that transforms wedding inspiration into real purchases by directly connecting engaged couples with local vendors. 

## Tech Stack

- **Meta Framework**: [Next.js 15](https://nextjs.org/docs) with App Router and [React 19](https://react.dev/reference/react)
- **Client Side Fetching**: [Tanstack Query](https://tanstack.com/query/latest/docs/framework/react/overview)
- **Forms**: [Tanstack Form](https://tanstack.com/form/latest/docs/overview) with [Zod](https://zod.dev/)
- **Database**: [Supabase PostgreSQL](https://supabase.com/docs/guides/database/overview) with [Drizzle ORM](https://orm.drizzle.team/docs/rqb)
- **Authentication**: [Supabase Auth](https://supabase.com/docs/guides/auth) with SSR
- **Storage**: [Uploadthing](https://docs.uploadthing.com/)
- **Styling**: [Tailwind CSS v3](https://v3.tailwindcss.com/) with [shadcn/ui](https://ui.shadcn.com/docs) components
- **Language**: TypeScript throughout

## Project Structure
```yaml
/
├── actions/ # Server actions (Next.js)
├── app/ # Next.js App Router pages
├── components/ # React components
├── db/ # Database schema and migrations
├── docs/ # Documentation
├── hooks/ # Custom React hooks
├── models/ # TypeScript type definitions
├── public/ # Static assets
└── utils/ # Utility functions
```

For architecture and development patterns, see [architecture.md](docs/architecture.md).

## Getting Started

1. Install dependencies:
   ```bash
   pnpm install
   ```

2. Set up your environment variables:
   ```bash
   pnpm vercel env pull
   ```

3. Run database migrations:
   ```bash
   pnpm db:migrate
   ```

4. Start the development server:
   ```bash
   pnpm dev
   ```

5. Run linting:
   ```bash
   pnpm lint
   ```

The project uses Next.js's ESLint configuration with TypeScript support. See `.eslintrc.json` for the complete configuration.

## Contributing

1. Create a feature branch from `main`
2. Follow existing development patterns
3. Include types for all new code
4. Add tests for new features
5. Run tests and lint checks
6. Submit a pull request

### Database Migrations
- Use Drizzle for database schema management
- Generate migrations with `pnpm db:generate`
- Apply migrations with `pnpm db:migrate`
- Bypass migration pattern with `pnpm db:push` (for initial setup only)

### Code Quality
- TypeScript for type safety
- ESLint for code quality
- Prettier for code formatting

## Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Drizzle ORM Documentation](https://orm.drizzle.team)
- [shadcn/ui Documentation](https://ui.shadcn.com)