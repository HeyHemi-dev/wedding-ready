import { NextResponse } from 'next/server'

// ============================================================================
// ERROR MESSAGES - Centralized error message definitions
// ============================================================================

export const ERROR_MESSAGE = {
  // Authentication errors (401)
  NOT_AUTHENTICATED: 'Authentication required',

  // Authorization errors (403)
  FORBIDDEN: 'Insufficient permissions',

  // Validation errors (400)
  VALIDATION_ERROR: 'Invalid data',
  INVALID_INPUT: 'Invalid input',

  // Business logic errors (400)
  BUSINESS_RULE_VIOLATION: 'Operation violates business rules',
  RESOURCE_CONFLICT: 'Resource conflict',

  // Resource errors (404)
  RESOURCE_NOT_FOUND: 'Resource not found',

  // Server errors (500)
  INTERNAL_SERVER_ERROR: 'Internal server error',
  DATABASE_ERROR: 'Database operation failed',
} as const

export type ErrorMessage = (typeof ERROR_MESSAGE)[keyof typeof ERROR_MESSAGE]

// ============================================================================
// OPERATION ERRORS - For use in business logic/operations layer
// ============================================================================

export const OPERATION_ERROR = {
  NOT_AUTHENTICATED: (message?: string) => new Error(message ?? ERROR_MESSAGE.NOT_AUTHENTICATED),

  FORBIDDEN: (message?: string) => new Error(message ?? ERROR_MESSAGE.FORBIDDEN),

  VALIDATION_ERROR: (message?: string) => new Error(message ?? ERROR_MESSAGE.VALIDATION_ERROR),

  BUSINESS_RULE_VIOLATION: (message?: string) => new Error(message ?? ERROR_MESSAGE.BUSINESS_RULE_VIOLATION),

  RESOURCE_CONFLICT: (message?: string) => new Error(message ?? ERROR_MESSAGE.RESOURCE_CONFLICT),

  // Resource not found
  RESOURCE_NOT_FOUND: (message?: string) => new Error(message ?? ERROR_MESSAGE.RESOURCE_NOT_FOUND),

  // Database/system errors
  DATABASE_ERROR: (message?: string) => new Error(message ?? ERROR_MESSAGE.DATABASE_ERROR),
} as const

// ============================================================================
// HTTP ERRORS - For use in API routes (NextResponse)
// ============================================================================

export const HTTP_ERROR = {
  BAD_REQUEST: (message?: string) =>
    NextResponse.json(
      {
        code: 'Bad Request',
        message,
      },
      { status: 400 }
    ),

  UNAUTHORIZED: (message?: string) =>
    NextResponse.json(
      {
        code: 'Unauthorized',
        message,
      },
      { status: 401 }
    ),

  FORBIDDEN: (message?: string) =>
    NextResponse.json(
      {
        code: 'Forbidden',
        message,
      },
      { status: 403 }
    ),

  NOT_FOUND: (message?: string) =>
    NextResponse.json(
      {
        code: 'Not Found',
        message,
      },
      { status: 404 }
    ),

  INTERNAL_SERVER_ERROR: (message?: string) =>
    NextResponse.json(
      {
        code: 'Internal Server Error',
        message,
      },
      { status: 500 }
    ),
} as const

/** @deprecated Use HTTP_ERROR instead */
export const ROUTE_ERROR = {
  VALIDATION_ERROR: HTTP_ERROR.BAD_REQUEST,
  NOT_AUTHENTICATED: HTTP_ERROR.UNAUTHORIZED,
  FORBIDDEN: HTTP_ERROR.FORBIDDEN,
  RESOURCE_NOT_FOUND: HTTP_ERROR.NOT_FOUND,
  INTERNAL_SERVER_ERROR: HTTP_ERROR.INTERNAL_SERVER_ERROR,
} as const
