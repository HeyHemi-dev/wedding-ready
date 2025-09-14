import { NextResponse } from 'next/server'

// ============================================================================
// ERROR CODES - Centralized error code definitions
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

export type ErrorCode = (typeof ERROR_MESSAGE)[keyof typeof ERROR_MESSAGE]

// ============================================================================
// OPERATION ERRORS - For use in business logic/operations layer
// ============================================================================

export const OPERATION_ERROR = {
  // Authentication - user is not signed in
  NOT_AUTHENTICATED: (message?: string) => new Error(message ?? ERROR_MESSAGE.NOT_AUTHENTICATED),

  // Authorization - user is authenticated but lacks permission
  FORBIDDEN: (message?: string) => new Error(message ?? ERROR_MESSAGE.FORBIDDEN),

  // Validation - input data doesn't meet requirements
  VALIDATION_ERROR: (message?: string) => new Error(message ?? ERROR_MESSAGE.VALIDATION_ERROR),

  // Business logic - operation violates business rules
  BUSINESS_RULE_VIOLATION: (message?: string) => new Error(message ?? ERROR_MESSAGE.BUSINESS_RULE_VIOLATION),

  // Resource conflicts - duplicate resources, etc.
  RESOURCE_CONFLICT: (message?: string) => new Error(message ?? ERROR_MESSAGE.RESOURCE_CONFLICT),

  // Resource not found
  RESOURCE_NOT_FOUND: (message?: string) => new Error(message ?? ERROR_MESSAGE.RESOURCE_NOT_FOUND),

  // Database/system errors
  DATABASE_ERROR: (message?: string) => new Error(message ?? ERROR_MESSAGE.DATABASE_ERROR),
} as const

// ============================================================================
// ROUTE ERRORS - For use in API routes (NextResponse)
// ============================================================================

export const ROUTE_ERROR = {
  // 400 - Bad Request
  VALIDATION_ERROR: (message?: string) =>
    NextResponse.json(
      {
        code: ERROR_MESSAGE.VALIDATION_ERROR,
        message,
      },
      { status: 400 }
    ),

  BUSINESS_RULE_VIOLATION: (message?: string) =>
    NextResponse.json(
      {
        code: ERROR_MESSAGE.BUSINESS_RULE_VIOLATION,
        message,
      },
      { status: 400 }
    ),

  RESOURCE_CONFLICT: (message?: string) =>
    NextResponse.json(
      {
        code: ERROR_MESSAGE.RESOURCE_CONFLICT,
        message,
      },
      { status: 400 }
    ),

  // 401 - Unauthorized (not authenticated)
  NOT_AUTHENTICATED: (message?: string) =>
    NextResponse.json(
      {
        code: ERROR_MESSAGE.NOT_AUTHENTICATED,
        message,
      },
      { status: 401 }
    ),

  // 403 - Forbidden (authenticated but not authorized)
  FORBIDDEN: (message?: string) =>
    NextResponse.json(
      {
        code: ERROR_MESSAGE.FORBIDDEN,
        message,
      },
      { status: 403 }
    ),

  // 404 - Not Found
  RESOURCE_NOT_FOUND: (message?: string) =>
    NextResponse.json(
      {
        code: ERROR_MESSAGE.RESOURCE_NOT_FOUND,
        message,
      },
      { status: 404 }
    ),

  // 500 - Internal Server Error
  INTERNAL_SERVER_ERROR: (message?: string) =>
    NextResponse.json(
      {
        code: ERROR_MESSAGE.INTERNAL_SERVER_ERROR,
        message,
      },
      { status: 500 }
    ),

  DATABASE_ERROR: (message?: string) =>
    NextResponse.json(
      {
        code: ERROR_MESSAGE.DATABASE_ERROR,
        message,
      },
      { status: 500 }
    ),
} as const
