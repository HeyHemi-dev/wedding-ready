import { tileActions } from '@/app/_actions/tile-actions'

import { Location, Service } from './constants'
import { client as dbClient } from './connection'
import seedImages from './seedimages.json' assert { type: 'json' }
import { authActions } from '@/app/_actions/auth-actions'
import { supplierActions } from '@/operations/supplier-actions'
import { SupplierRegistrationForm, UserSignupForm } from '@/app/_types/validation-schema'
import * as t from '@/models/types'
import { createAdminClient } from '@/utils/supabase/server'

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
  type UploadThingImage = {
    name: string
    key: string
    customId: string | null
    url: string
    size: number
    uploadedAt: string
  }

  const UPLOADTHING_IMAGES = seedImages as UploadThingImage[]

  await Promise.all(
    UPLOADTHING_IMAGES.map(async (image: UploadThingImage) => {
      const tileRawData: t.InsertTileRaw = {
        createdByUserId: user.id,
        imagePath: image.url,
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
