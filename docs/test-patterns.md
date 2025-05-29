# Test Patterns

This document outlines the testing patterns and best practices used in the WeddingReady codebase.

## Test Structure

### File Organization
- Test files are co-located with their implementation files
- Test files use the `.test.ts` or `.test.tsx` extension
- Component tests use `.test.tsx`, utility/action tests use `.test.ts`

### Test Suite Organization
```typescript
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'

// 1. External dependencies
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

// 2. Internal dependencies
import { authActions } from '@/app/_actions/auth-actions'
import { isProtectedPath } from '@/utils/auth'

// 3. Component/function being tested
import { SignOutForm } from './signout-form'

// 4. Mock setup
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
}))

// 5. Test constants
const TEST_USER = {
  id: 'test-user-id',
  // ... other test data
} as const

// 6. Test suite
describe('ComponentName', () => {
  // Setup and teardown
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    document.body.innerHTML = ''
  })

  // Test cases
  test('should do something specific', async () => {
    // Arrange
    // Act
    // Assert
  })
})
```

## Testing Patterns

### 1. Component Testing
- Use `@testing-library/react` for component testing
- Test both authenticated and unauthenticated states
- Use data-testid attributes for querying elements
- Test user interactions using `fireEvent` or `userEvent`

Example:
```typescript
test('should show sign-in/sign-up when user is not authenticated', async () => {
  // Arrange
  vi.mocked(getCurrentUser).mockResolvedValueOnce(null)

  // Act
  render(await Header())

  // Assert
  expect(screen.getByTestId('sign-in')).toBeInTheDocument()
  expect(screen.getByTestId('sign-up')).toBeInTheDocument()
  expect(screen.queryByTestId('user-menu-trigger')).not.toBeInTheDocument()
})
```

### 2. Form Action Testing
- Test both success and error paths
- Mock external dependencies (auth, router, etc.)
- Verify correct redirects and side effects
- Test protected vs unprotected routes

Example:
```typescript
test('should handle successful sign out', async () => {
  // Arrange
  vi.mocked(authActions.signOut).mockResolvedValueOnce(undefined)
  vi.mocked(isProtectedPath).mockReturnValueOnce(false)

  // Act
  const result = await SignOutFormAction({ pathname: '/unprotected' })

  // Assert
  expect(authActions.signOut).toHaveBeenCalled()
  expect(result).toEqual({ redirectTo: '/unprotected' })
})
```

### 3. Form Component Testing
- Test form submission handling
- Verify loading states
- Test error handling and user feedback
- Check navigation after form actions

Example:
```typescript
test('should handle sign out error', async () => {
  // Arrange
  vi.mocked(SignOutFormAction).mockRejectedValueOnce(new Error())
  const { unmount } = renderSignOutForm()

  // Act
  fireEvent.click(screen.getByTestId('sign-out'))

  // Assert
  await waitFor(() => {
    expect(toast.error).toHaveBeenCalled()
    expect(mockRouter.push).not.toHaveBeenCalled()
  })

  unmount()
})
```

## Best Practices

1. **Arrange-Act-Assert Pattern**
   - Structure tests using the Arrange-Act-Assert pattern
   - Use clear comments to separate each section
   - Keep each section focused on its purpose

2. **Mocking**
   - Mock external dependencies at the top of the file
   - Use `vi.mock()` for module mocking
   - Clear mocks in `beforeEach`
   - Clean up DOM in `afterEach`

3. **Test Data**
   - Define test constants outside test cases
   - Use `as const` for type safety
   - Keep test data minimal but realistic

4. **Assertions**
   - Use specific assertions (e.g., `toBeInTheDocument()`)
   - Test both positive and negative cases
   - Verify side effects (toasts, navigation, etc.)

5. **Async Testing**
   - Use `async/await` for asynchronous tests
   - Use `waitFor` for async assertions
   - Clean up async operations in `afterEach`

6. **Component Testing**
   - Test user interactions
   - Verify component states
   - Test accessibility where relevant
   - Use data-testid for stable selectors

## Running Tests

```bash
# Run all tests
pnpm test
```

## Common Issues

1. **Database Connections**
   - Tests may show database connection attempts
   - These are expected and can be ignored if tests pass
   - Consider mocking database calls in unit tests

2. **Deprecation Warnings**
   - Some Node.js deprecation warnings may appear
   - These don't affect test results
   - Update dependencies when possible to resolve

3. **Test Isolation**
   - Always clean up after tests
   - Use `beforeEach` and `afterEach` for setup/teardown
   - Avoid test interdependence 