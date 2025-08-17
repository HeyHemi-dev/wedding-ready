# Test Patterns

This document outlines the testing patterns and best practices used in the WeddingReady codebase.

## Test Strategy

**Integration Testing Focus**: This project uses integration tests instead of unit tests. Integration tests verify that multiple components work together correctly, providing confidence that the entire system functions as expected.

## Test Structure

### File Organization
- Test files are co-located with their implementation files
- Test files use the `.test.ts` or `.test.tsx` extension
- Component tests use `.test.tsx`, operation/action tests use `.test.ts`

### Test Suite Organization
```typescript

// vitest suite
import { describe, expect, test, beforeEach, afterEach } from 'vitest'
// operation to test
import { supplierOperations } from '@/operations/supplier-operations'
// test helpers
import { scene, TEST_SUPPLIER } from '@/testing/scene'

// Test suite
describe('supplierOperations', () => {
  beforeEach(async () => {
    // Clean up test data before each test
    await scene.withoutSupplier({ handle: TEST_SUPPLIER.handle })
  })

  afterEach(async () => {
    // Additional cleanup if needed
  })

  // Test cases
  test('should successfully register a new supplier', async () => {
    // Arrange
    // Act
    // Assert
  })
})
```

## Testing Patterns

### 1. Integration Testing with Scene Pattern
For all tests that require database state, use the scene pattern from `@/testing/scene.ts`. This provides a clean, declarative way to set up test data and verify complete system behavior:

```typescript
import { scene } from '@/testing/scene'

test('should successfully register a new supplier', async () => {
  // Arrange - Use scene to set up complete test data
  const user = await scene.hasUser()
  
  // Act - Test the complete operation
  const result = await supplierOperations.register({
    ...TEST_SUPPLIER,
    createdByUserId: user.id,
  })

  // Assert - Verify the complete result
  expect(result).toBeDefined()
  expect(result.handle).toBe(TEST_SUPPLIER.handle)
  expect(result.services).toHaveLength(2)
  expect(result.locations).toHaveLength(1)
})
```

**Scene Methods:**
- `scene.hasUser()` - Creates or retrieves a user
- `scene.hasSupplier()` - Creates or retrieves a supplier with services and locations
- `scene.hasTile()` - Creates or retrieves a tile
- `scene.withoutUser()` - Removes a user (cleanup)
- `scene.withoutSupplier()` - Removes a supplier (cleanup)


## Best Practices

1. **Integration Testing Focus**
   - Test complete operations, not individual functions
   - Use real database interactions
   - Verify end-to-end behavior
   - Test error conditions with real data

2. **Scene Pattern Usage**
   - Use scene methods for consistent test data setup
   - Clean up test data in `beforeEach` or `afterEach`
   - Scene methods are idempotent - safe to call multiple times
   - Always provide required fields when calling scene methods

3. **Test Data Management**
   - Define test constants outside test cases
   - Use `as const` for type safety
   - Keep test data minimal but realistic
   - Use scene pattern for complex database state

4. **Assertions**
   - Verify complete results, not just individual fields
   - Test both positive and negative cases
   - Verify side effects (database state, auth state, etc.)
   - Use specific assertions for better error messages

5. **Async Testing**
   - Use `async/await` for all tests
   - Handle cleanup in `beforeEach`/`afterEach`
   - Test real async operations
   - Verify complete state after operations

6. **Database Testing**
   - Use scene pattern for setting up test data
   - Test both creation and retrieval operations
   - Verify related data is properly created
   - Clean up test data after tests

7. **Error Testing**
   - Test error conditions with real data
   - Verify proper error messages are thrown
   - Test edge cases and invalid inputs
   - Ensure error handling is consistent

## Running Tests

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test --watch

# Run specific test file
pnpm test src/operations/supplier-operations.test.ts

# Run tests with coverage
pnpm test --coverage
```

## Common Issues

1. **Database Connections**
   - Tests use real database connections
   - Ensure test database is properly configured
   - Use scene pattern for consistent data setup
   - Avoid nesting/multiple supabase clients

2. **Test Isolation**
   - Always clean up after tests
   - Use `beforeEach` for setup and cleanup
   - Avoid test interdependence
   - Use scene pattern for consistent test data setup

3. **Scene Pattern Usage**
   - Always provide required fields when calling scene methods
   - Use scene methods for complex data setup
   - Scene methods are idempotent - safe to call multiple times
   - Clean up test data using appropriate scene methods

4. **Integration Test Performance**
   - Integration tests are slower than unit tests
   - Focus on testing critical paths
   - Use parallel test execution when possible
   - Consider test data caching for expensive setup

