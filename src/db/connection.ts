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

export const client = postgres(connectionString, {
  prepare: false, // Required for transaction pool mode
  // Remove client-side connection management since it's handled by the pooler
  // max_lifetime and other pool settings are managed by the pooler
})

export const db = drizzle(client, { schema })
