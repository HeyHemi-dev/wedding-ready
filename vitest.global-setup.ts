import { scene } from './src/testing/scene'

export default async function globalSetup() {
  console.log('Clean up before tests')
  await scene.cleanupStaleNamespacedData()

  return async () => {
    console.log('Clean up after tests')
    await scene.cleanupStaleNamespacedData()
  }
}
