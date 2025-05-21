import { config } from 'dotenv'
import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'

import * as schema from './schema'

// Load .env.local for local development or Vercel development environments
// Vercel automatically sets env vars for preview/production
if (!process.env.VERCEL_ENV || process.env.VERCEL_ENV === 'development') {
  config({ path: '.env.local', override: true })
}

const connectionString = process.env.DATABASE_URL!
console.log('Attempting to connect with:', connectionString)

// Disable prefetch as it is not supported for "Transaction" pool mode
export const client = postgres(connectionString, { prepare: false })
export const db = drizzle(client, { schema })
