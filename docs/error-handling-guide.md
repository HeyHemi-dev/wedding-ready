# Error Handling Guide

## Overview

This guide explains our standardized error handling approach, which separates concerns between authentication, authorization, validation, business logic, and system errors.

## Error Categories

### 1. Authentication Errors (401)
- **When to use**: User is not signed in
- **Operation level**: `OPERATION_ERROR.NOT_AUTHENTICATED()`
- **Route level**: `ROUTE_ERROR.NOT_AUTHENTICATED()`

### 2. Authorization Errors (403)
- **When to use**: User is authenticated but lacks permission for this specific action
- **Operation level**: `OPERATION_ERROR.FORBIDDEN()`
- **Route level**: `ROUTE_ERROR.FORBIDDEN()`

### 3. Validation Errors (400)
- **When to use**: Input data doesn't meet format/type requirements
- **Operation level**: `OPERATION_ERROR.VALIDATION_ERROR()`
- **Route level**: `ROUTE_ERROR.VALIDATION_ERROR()`

### 4. Business Logic Errors (400)
- **When to use**: Operation violates business rules (e.g., trying to create duplicate resources)
- **Operation level**: `OPERATION_ERROR.BUSINESS_RULE_VIOLATION()`
- **Route level**: `ROUTE_ERROR.BUSINESS_RULE_VIOLATION()`

### 5. Resource Conflicts (400)
- **When to use**: Duplicate resources, handle already taken, etc.
- **Operation level**: `OPERATION_ERROR.RESOURCE_CONFLICT()`
- **Route level**: `ROUTE_ERROR.RESOURCE_CONFLICT()`

### 6. Resource Not Found (404)
- **When to use**: Requested resource doesn't exist
- **Operation level**: `OPERATION_ERROR.RESOURCE_NOT_FOUND()`
- **Route level**: `ROUTE_ERROR.RESOURCE_NOT_FOUND()`

### 7. System Errors (500)
- **When to use**: Database failures, unexpected system errors
- **Operation level**: `OPERATION_ERROR.DATABASE_ERROR()`
- **Route level**: `ROUTE_ERROR.DATABASE_ERROR()` or `ROUTE_ERROR.INTERNAL_SERVER_ERROR()`

## Usage Examples

### In Operations (Business Logic Layer)

```typescript
// Authentication check
if (!authUserId) {
  throw OPERATION_ERROR.NOT_AUTHENTICATED()
}

// Authorization check
if (tile.createdByUserId !== authUserId) {
  throw OPERATION_ERROR.FORBIDDEN('Only the tile creator can modify credits')
}

// Business rule validation
if (credits.length === 0) {
  throw OPERATION_ERROR.BUSINESS_RULE_VIOLATION('At least one credit is required')
}

// Resource conflict
if (!isHandleAvailable) {
  throw OPERATION_ERROR.RESOURCE_CONFLICT('Handle is already taken')
}

// Resource not found
if (!user) {
  throw OPERATION_ERROR.RESOURCE_NOT_FOUND('User not found')
}
```

### In API Routes

```typescript
// Handle operation errors
const { data, error } = await tryCatch(tileOperations.createCreditForTile(params))
if (error) {
  // Map operation errors to route errors
  if (error.message.includes('Authentication required')) {
    return ROUTE_ERROR.NOT_AUTHENTICATED()
  }
  if (error.message.includes('Insufficient permissions')) {
    return ROUTE_ERROR.FORBIDDEN()
  }
  if (error.message.includes('Resource not found')) {
    return ROUTE_ERROR.RESOURCE_NOT_FOUND()
  }
  if (error.message.includes('Operation violates business rules')) {
    return ROUTE_ERROR.BUSINESS_RULE_VIOLATION(error.message)
  }
  if (error.message.includes('Resource conflict')) {
    return ROUTE_ERROR.RESOURCE_CONFLICT(error.message)
  }
  return ROUTE_ERROR.INTERNAL_SERVER_ERROR()
}

// Input validation
const parsed = schema.safeParse(body)
if (!parsed.success) {
  return ROUTE_ERROR.VALIDATION_ERROR('Invalid input data')
}
```

## Migration from Old Error Types

### Before (Problematic)
```typescript
// Confusing - mixing auth concepts
throw OPERATION_ERROR.UNAUTHORIZED() // Was this auth or authz?

// Overused - doing too much
throw OPERATION_ERROR.BAD_REQUEST() // Validation? Business rule? Conflict?
```

### After (Clear)
```typescript
// Clear separation
throw OPERATION_ERROR.NOT_AUTHENTICATED() // Not signed in
throw OPERATION_ERROR.FORBIDDEN() // Signed in but no permission

// Specific purposes
throw OPERATION_ERROR.VALIDATION_ERROR() // Input format wrong
throw OPERATION_ERROR.BUSINESS_RULE_VIOLATION() // Business rule broken
throw OPERATION_ERROR.RESOURCE_CONFLICT() // Duplicate resource
```

## Key Benefits

1. **Clear Separation**: Authentication vs Authorization are distinct
2. **Specific Purpose**: Each error type has a clear, single responsibility
3. **Better UX**: Clients can handle different error types appropriately
4. **Easier Debugging**: Error messages are more descriptive
5. **Consistent API**: All routes follow the same error pattern

## Error Response Format

All API errors follow this format:
```json
{
  "code": "ERROR_CODE",
  "message": "Human readable message"
}
```

With appropriate HTTP status codes:
- 400: Validation, Business Logic, Resource Conflicts
- 401: Not Authenticated
- 403: Forbidden (Authenticated but not authorized)
- 404: Resource Not Found
- 500: Internal Server Error, Database Error
