// import { NextResponse } from 'next/server'

// import * as t from '@/models/types'
// import { tileOperations } from '@/operations/tile-operations'
// import { getAuthUserId } from '@/utils/auth'
// import { Supplier } from '@/app/_types/suppliers'
// import { TileCreate, tileCreateSchema } from '@/app/_types/validation-schema'
// import { tryCatch } from '@/utils/try-catch'
// import { ROUTE_ERROR } from '@/app/_types/errors'

// export type tileNewRequestBody = TileCreate

// export type tileNewResponseBody = { id: string }

// // Create a new tile
// export async function POST(req: Request): Promise<NextResponse> {
//   const body = (await req.json()) as tileNewRequestBody

//   const { data: validatedBody, error } = tileCreateSchema.safeParse(body)
//   if (error) {
//     return ROUTE_ERROR.INVALID_REQUEST()
//   }

//   const authUserId = await getAuthUserId()
//   if (!authUserId || authUserId !== body.createdByUserId) {
//     return ROUTE_ERROR.UNAUTHORIZED()
//   }

//   const tile = await tileOperations.createForSupplier(validatedBody)

//   return NextResponse.json({ id: tile.id })
// }
