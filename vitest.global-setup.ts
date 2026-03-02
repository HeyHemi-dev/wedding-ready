import { client } from '@/db/connection'
import { scene } from './src/testing/scene'

export default async function globalSetup() {
  console.log('Clean up before tests')
  await scene.cleanupStaleData()

  return async () => {
    console.log('Clean up after tests')
    await scene.cleanupStaleData()
    await client.end()
  }
}
