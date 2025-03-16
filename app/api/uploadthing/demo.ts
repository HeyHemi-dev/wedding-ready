// startUpload(files, ids) // passed to useUploadThing

// export const uploadthingRouter = {
//   tileUploader: f({
//     //
//   })
//     .input(uploaderInputSchema) // Zod array
//     .middleware(async ({ req, input }) => {
//       const user = await getCurrentUser()
//       if (!user) throw new UploadThingError('Unauthorized')

//       const ids = uploaderInputSchema.parse(input)
//       return {
//         userId: user.id,
//         ids: ids,
//       }
//     })
//     .onUploadComplete(async ({ metadata, file }) => {
//       console.log('metadata', metadata)
//     }),
// }

// Console output:
// metadata {
//   userId: '123',
//   ids: ['123', '456'],
// }
