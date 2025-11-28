# Wedding Ready

Wedding Ready is a web app that converts wedding inspiration into real purchases by directly connecting engaged couples with local suppliers.

## Documentation

- [Tech stack](docs/tech-stack.md)
- [Project folders](docs/folder-structure.md)
- [Architecture](docs/architecture.md)
- [Development patterns and examples](docs/patterns.md)
- [Auth](docs/auth.md)
- [Overused hooks and substitutes](docs/substitutes.md)

## Getting Started

First install: Pnpm, Docker, Supabase local.

1. Install dependencies:

   ```bash
   pnpm install
   ```

2. Set up your environment variables:

   ```bash
   pnpm vercel env pull
   ```

3. Run database migrations/seed file:
   You may need to replace the first empty migration, with the contents of the file in `@/db/baseline`

   ```bash
   pnpm db:migrate
   pnpm db:seed
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
3. Lean into type safety
4. Add integration tests for all new operations
5. Run tests and lint checks
6. Submit a pull request

### Database Migrations

- Use Drizzle for database schema management
- Generate migrations with `pnpm db:generate`. Check generated SQL before applying migration files.
- Apply migrations with `pnpm db:migrate`
- Seed database with `pnpm db:seed`
- Reset local database with `pnpm db:reset`
<!-- - Bypass migration pattern with `pnpm db:push` (for initial setup only) -->

### Linting/Formatting

- ESLint for code quality `pnpm lint`
- Prettier for code formatting
- Tailwind prettier plugin: `prettier-plugin-tailwindcss`
- Tailwind CSS IntelliSense extension: `bradlc.vscode-tailwindcss`


## Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Drizzle ORM Documentation](https://orm.drizzle.team)
- [shadcn/ui Documentation](https://ui.shadcn.com)
