import { tileActions } from '@/app/_actions/tile-actions'

import { Location, Service } from './constants'
import { client as dbClient } from './db'
import { authActions } from '../app/_actions/auth-actions'
import { supplierActions } from '../app/_actions/supplier-actions'
import { SupplierRegistrationForm, UserSignupForm } from '../app/_types/validation-schema'
import * as t from '../models/types'
import { createAdminClient } from '../utils/supabase/server'

async function seedDatabase() {
  console.log('seeding database...')
  const supabaseAdmin = createAdminClient()
  const ORIGIN = 'http://localhost:3000'

  // Create an auth user
  const AUTH_USER: UserSignupForm = {
    email: 'hello.hemi.phillips@gmail.com',
    password: 'password',
    displayName: 'Hemi Phillips',
    handle: 'heyhemi',
  }
  const user = await authActions.signUp({ userSignFormData: AUTH_USER, supabaseClient: supabaseAdmin, origin: ORIGIN })
  console.log('user created')

  // Create a supplier
  const SUPPLIER: SupplierRegistrationForm = {
    name: 'Patina Photo',
    handle: 'patina_photo',
    websiteUrl: 'https://patina.photo',
    description: 'We are wedding photographers + videographers who travel NZ, capturing all the feels from the party of a lifetime.',
    locations: [Location.WELLINGTON, Location.AUCKLAND, Location.CANTERBURY],
    services: [Service.PHOTOGRAPHER, Service.VIDEOGRAPHER],
    createdByUserId: user.id,
  }
  // also sets the user as an admin for the supplier
  const supplier = await supplierActions.register(SUPPLIER)
  console.log('supplier created')

  // Create some tiles

  const TILE_URLS: string[] = [
    'https://images.unsplash.com/photo-1606216794074-735e91aa2c92',
    'https://plus.unsplash.com/premium_photo-1675003662150-2569448d2b3b',
    'https://plus.unsplash.com/premium_photo-1664530452596-e1c17e342876',
    'https://images.unsplash.com/photo-1545232979-8bf68ee9b1af',
    'https://images.unsplash.com/photo-1583939003579-730e3918a45a',
    'https://plus.unsplash.com/premium_photo-1673897888993-a1db844c2ca1',
    'https://images.unsplash.com/photo-1649615644622-6d83f48e69c5',
    'https://images.unsplash.com/photo-1665607437981-973dcd6a22bb',
    'https://plus.unsplash.com/premium_photo-1674235768716-7b9469782103',
    'https://images.unsplash.com/photo-1649615644613-758b850399c1',
    'https://plus.unsplash.com/premium_photo-1664530452329-42682d3a73a7',
    'https://images.unsplash.com/photo-1521543387600-c745f8e83d77',
    'https://images.unsplash.com/photo-1721677337543-37b07e7e28b5',
    'https://plus.unsplash.com/premium_photo-1673569490592-fdbffc9b8f67',
    'https://images.unsplash.com/photo-1513278974582-3e1b4a4fa21e',
    'https://images.unsplash.com/photo-1613089347756-366a788dacf6',
    'https://images.unsplash.com/photo-1473177104440-ffee2f376098',
    'https://plus.unsplash.com/premium_photo-1674759668987-b6dfb30ab869',
    'https://plus.unsplash.com/premium_photo-1674759862119-1de17bed7b20',
    'https://plus.unsplash.com/premium_photo-1673897847791-503a222307a8',
    'https://images.unsplash.com/photo-1563392317152-12e7e2d48be0',
    'https://images.unsplash.com/photo-1661805238303-11d19d3d30d1',
    'https://plus.unsplash.com/premium_photo-1664790560419-d769799d76b1',
  ]

  // Save some tiles for the supplier
  await Promise.all(
    TILE_URLS.map(async (url) => {
      const tileRawData: t.InsertTileRaw = {
        createdByUserId: user.id,
        imagePath: url,
        location: Location.WELLINGTON,
      }
      return await tileActions.createForSupplier({ InsertTileRawData: tileRawData, supplierIds: [supplier.id] })
    })
  )
  console.log('tiles created')
}

// --- Run the seeding logic and ensure exit ---
seedDatabase()
  .then(() => {
    console.log('Seed completed successfully.')
    process.exit(0) // Exit with success code
  })
  .catch((error) => {
    console.error('\nError running seed script:', error)
    process.exit(1) // Exit with error code
  })
  .finally(async () => {
    await dbClient.end() // Ensure the database connection is closed
    console.log('Database connection closed.')
  })
