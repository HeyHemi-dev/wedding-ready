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

export const ROUTE_ERROR = {
  INVALID_REQUEST: (message = 'Invalid Request') =>
    NextResponse.json(
      {
        code: 'INVALID_REQUEST',
        message: message,
      },
      { status: 400 }
    ),
  UNAUTHORIZED: (message = 'Unauthorized') =>
    NextResponse.json(
      {
        code: 'UNAUTHORIZED',
        message: message,
      },
      { status: 401 }
    ),
  FORBIDDEN: (message = 'Forbidden') =>
    NextResponse.json(
      {
        code: 'FORBIDDEN',
        message: message,
      },
      { status: 403 }
    ),
  NOT_FOUND: (message = 'Not Found') =>
    NextResponse.json(
      {
        code: 'NOT_FOUND',
        message: message,
      },
      { status: 404 }
    ),
  INTERNAL_SERVER_ERROR: (message = 'Internal Server Error') =>
    NextResponse.json(
      {
        code: 'INTERNAL_SERVER_ERROR',
        message: message,
      },
      { status: 500 }
    ),
}

export const OPERATION_ERROR = {
  UNAUTHORIZED: (message = 'Unauthorized') => new Error(message),
  FORBIDDEN: (message = 'Forbidden') => new Error(message),
  DATA_INTEGRITY: (message = 'Data Integrity') => new Error(message),
  NOT_FOUND: (message = 'Not Found') => new Error(message),
  HANDLE_TAKEN: (message = 'Handle is already taken') => new Error(message),
  BAD_REQUEST: (message = 'Bad Request') => new Error(message),
}
