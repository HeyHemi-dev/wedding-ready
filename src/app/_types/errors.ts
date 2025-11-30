import { NextResponse } from 'next/server'

// ============================================================================
// ERROR MESSAGES - Centralized error message definitions
// ============================================================================

export const ERROR_MESSAGE = {
  // Authentication errors (401)
  NOT_AUTHENTICATED: 'Authentication required. Please sign in and try again.',

  // Authorization errors (403)
  FORBIDDEN: 'Insufficient permissions. You do not have permission to perform this action.',

  // Validation errors (400)
  VALIDATION_ERROR: 'Invalid data.',
  INVALID_INPUT: 'Invalid input',

  // Business logic errors (400)
  BUSINESS_RULE_VIOLATION: 'Operation violates business rules',
  RESOURCE_CONFLICT: 'Resource conflict',
  INVALID_STATE: 'Invalid state',

  // Resource errors (404)
  RESOURCE_NOT_FOUND: 'Resource not found. Please refresh and try again.',

  // Server errors (500)
  INTERNAL_SERVER_ERROR: 'Internal server error',
  DATABASE_ERROR: 'Database operation failed',
  NETWORK_ERROR: 'Network error. Please check your connection and try again.',
  UNKNOWN_ERROR: 'An unexpected error occurred. Please try again.',
} as const

export type ErrorMessage = (typeof ERROR_MESSAGE)[keyof typeof ERROR_MESSAGE]

// ============================================================================
// TILE ERROR MESSAGES - Specific error messages for tile operations
// ============================================================================

export const TILE_ERROR_MESSAGE = {
  CREATE_FAILED: 'Failed to create tile',
} as const

export type TileErrorMessage = (typeof TILE_ERROR_MESSAGE)[keyof typeof TILE_ERROR_MESSAGE]

// ============================================================================
// OPERATION ERRORS - For use in business logic/operations layer
// ============================================================================

export const OPERATION_ERROR = {
  NOT_AUTHENTICATED: (message?: string) => new Error(message ?? ERROR_MESSAGE.NOT_AUTHENTICATED),

  FORBIDDEN: (message?: string) => new Error(message ?? ERROR_MESSAGE.FORBIDDEN),

  VALIDATION_ERROR: (message?: string) => new Error(message ?? ERROR_MESSAGE.VALIDATION_ERROR),

  BUSINESS_RULE_VIOLATION: (message?: string) => new Error(message ?? ERROR_MESSAGE.BUSINESS_RULE_VIOLATION),

  RESOURCE_CONFLICT: (message?: string) => new Error(message ?? ERROR_MESSAGE.RESOURCE_CONFLICT),

  INVALID_STATE: (message?: string) => new Error(message ?? ERROR_MESSAGE.INVALID_STATE),

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
