import { scene } from '@/testing/scene'

import { client as dbClient } from './connection'
import { LOCATIONS, SERVICES } from './constants'
import seedImages from './seedimages.json' assert { type: 'json' }

const AUTH_USER = {
  email: 'hello.hemi.phillips@gmail.com',
  password: 'password',
  displayName: 'Hemi Phillips',
  handle: 'heyhemi',
}

const SUPPLIER = {
  name: 'Patina Photo',
  handle: 'patina_photo',
  websiteUrl: 'https://patina.photo',
  description: 'We are wedding photographers + videographers who travel NZ, capturing all the feels from the party of a lifetime.',
  locations: [LOCATIONS.WELLINGTON, LOCATIONS.AUCKLAND, LOCATIONS.CANTERBURY],
  services: [SERVICES.PHOTOGRAPHER, SERVICES.VIDEOGRAPHER],
}

async function seedDatabase() {
  console.log('Seeding database...')

  const user = await scene.hasUser(AUTH_USER)
  console.log('User created')
  const supplier = await scene.hasSupplier({ createdByUserId: user.id, ...SUPPLIER })
  console.log('Supplier created')

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
      await scene.hasTile({
        createdByUserId: user.id,
        credits: [{ supplierId: supplier.id, service: supplier.services[0] }],
        imagePath: image.url,
        location: LOCATIONS.WELLINGTON,
      })
    })
  )
  console.log('Tiles created')
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
