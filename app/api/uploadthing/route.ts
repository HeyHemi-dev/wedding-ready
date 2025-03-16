import { createRouteHandler } from 'uploadthing/next'

import { uploadthingRouter } from './core'

// Export routes for Next App Router
export const { GET, POST } = createRouteHandler({
  router: uploadthingRouter,
})
