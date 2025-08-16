import { NextResponse } from 'next/server'

export const ROUTE_ERRORS = {
  UNAUTHORIZED: NextResponse.json(
    {
      code: 'UNAUTHORIZED',
      message: 'Unauthorized',
    },
    { status: 401 }
  ),
  FORBIDDEN: NextResponse.json(
    {
      code: 'FORBIDDEN',
      message: 'Forbidden',
    },
    { status: 403 }
  ),
  NOT_FOUND: NextResponse.json(
    {
      code: 'NOT_FOUND',
      message: 'Not Found',
    },
    { status: 404 }
  ),
  INTERNAL_SERVER_ERROR: NextResponse.json(
    {
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Internal Server Error',
    },
    { status: 500 }
  ),
  INVALID_REQUEST: NextResponse.json(
    {
      code: 'INVALID_REQUEST',
      message: 'Invalid Request',
    },
    { status: 400 }
  ),
}

export const OPERATION_ERROR = {
  UNAUTHORIZED: new Error('Unauthorized'),
  FORBIDDEN: new Error('Forbidden'),
  HANDLE_TAKEN: new Error('Handle is already taken'),
}
