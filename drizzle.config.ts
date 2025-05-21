import { defineConfig } from 'drizzle-kit'
import * as dotenv from 'dotenv'

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' })

export default defineConfig({
  schema: './src/db/schema.ts',
  out: './src/db/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL_SESSION_POOLER!,
  },
  verbose: true,
  schemaFilter: ['public'], //we exclude 'auth' schema so we can use auth.user for relations in the schema.ts without even though supabase does not allow auth schema to be overridden
})
