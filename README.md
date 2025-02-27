# WeddingReady

WeddingReady is a platform that transforms wedding inspiration into real purchases by directly connecting engaged couples with local vendors. 

## Tech Stack

- **Framework**: [Next.js 14](https://nextjs.org) with App Router
- **Database**: [Supabase PostgreSQL](https://supabase.com) with [Drizzle ORM](https://orm.drizzle.team)
- **Authentication**: Supabase Auth with SSR
- **Storage**: Supabase Storage
- **Styling**: [Tailwind CSS](https://tailwindcss.com) with [shadcn/ui](https://ui.shadcn.com) components
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