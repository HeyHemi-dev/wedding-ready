# WeddingReady

WeddingReady is a platform that transforms wedding inspiration into real purchases by directly connecting engaged couples with local vendors.

## Documentation

- [Tech stack](docs/tech-stack.md)
- [Project folders](docs/folder-structure.md)
- [Architecture](docs/architecture.md)
- [Development patterns and examples](docs/patterns.md)
- [Auth](docs/auth.md)
- [Overused hooks and substitutes](docs/substitutes.md)

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
   You may need to replace the first empty migration, with the contents of the file in `@/db/baseline`

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
- Generate migrations with `pnpm db:generate`. Check migration files before applying.
- Apply migrations with `pnpm db:migrate`
<!-- - Bypass migration pattern with `pnpm db:push` (for initial setup only) -->

### Code Quality

- TypeScript for type safety
- ESLint for code quality
- Prettier for code formatting

## Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Drizzle ORM Documentation](https://orm.drizzle.team)
- [shadcn/ui Documentation](https://ui.shadcn.com)
