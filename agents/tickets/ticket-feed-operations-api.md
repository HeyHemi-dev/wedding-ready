# Ticket: Core Feed Operations & API (Plumbing)

## Goal
Implement the backend feed functionality with scoring algorithm and cursor-based pagination. Get the API endpoint working so tiles can be fetched, scored, and paginated correctly. Source of truth: `agents/tile-feed-plan.md` (Ticket 1).

## Commit Steps

### 1. Add Feed Query Key & Types
- Add `feed` query key function to `src/app/_types/keys.ts`: `feed: (authUserId: string | null) => ['feed', authUserId]`.
- Create TypeScript types in `src/app/api/feed/route.ts`:
  - `FeedGetQueryParams` (Zod schema for `cursor?: string`, `limit?: number`).
  - `FeedGetResponseBody` (`{ tiles: TileListItem[], nextCursor: string | null, hasNextPage: boolean }`).
- Export types for use in hooks.

### 2. Implement Cursor Encoding/Decoding Utilities
- Create utility functions for cursor encoding/decoding:
  - `encodeCursor(score: number, createdAt: Date, id: string): string` - Base64 encode the tuple.
  - `decodeCursor(cursor: string): { score: number, createdAt: Date, id: string }` - Base64 decode and parse.
- Handle edge cases: null cursor (first page), invalid cursor format.
- Add unit tests for encoding/decoding functions.

### 3. Implement Feed Scoring Algorithm in Operations
- Add `tileOperations.getFeed({ authUserId, cursor, limit })` to `src/operations/tile-operations.ts`:
  - Query public tiles (`isPrivate = false`) with LEFT JOINs:
    - Count credits per tile (`COUNT(tile_suppliers.tile_id)`).
    - Count saves per tile (`COUNT(saved_tiles.tile_id) WHERE isSaved = true`).
  - Calculate quality score in SQL:
    - `CASE WHEN title IS NOT NULL THEN 1 ELSE 0 END + CASE WHEN description IS NOT NULL THEN 1 ELSE 0 END + CASE WHEN credit_count > 0 THEN 1 ELSE 0 END`.
  - Calculate composite score in SQL:
    - Recency: `1 / (EXTRACT(EPOCH FROM (NOW() - createdAt)) / 86400 + 1)` with log decay.
    - Quality: quality score (0-3 scale).
    - Social: `LOG(save_count + 1)`.
    - Composite: `recencyWeight * recency + qualityWeight * quality + socialWeight * social` (weights: 0.4, 0.3, 0.3).
  - Implement cursor-based pagination:
    - If cursor provided, decode and filter: `WHERE (score, createdAt, id) < (cursor.score, cursor.createdAt, cursor.id)`.
    - Order by: `ORDER BY score DESC, createdAt DESC, id DESC`.
    - Limit results to `limit` (default 20).
  - Calculate `hasNextPage`: fetch `limit + 1` rows, if extra row exists, `hasNextPage = true`.
  - Generate `nextCursor`: encode last row's `(score, createdAt, id)` tuple, or `null` if no next page.
  - Include `isSaved` state per tile if `authUserId` provided (reuse existing `getSavedStates` helper).
  - Return `{ tiles: TileListItem[], nextCursor: string | null, hasNextPage: boolean }`.
- Add to `tileOperations` export object.

### 4. Create Feed API Route
- Create `src/app/api/feed/route.ts`:
  - GET handler that:
    - Parses query params with Zod schema (`cursor?: string`, `limit?: number`).
    - Resolves `authUserId` from session using `getAuthUserId()` (optional, returns `null` if not authenticated).
    - Calls `tileOperations.getFeed({ authUserId, cursor, limit })`.
    - Returns JSON response: `{ tiles, nextCursor, hasNextPage }`.
    - Handles errors with `tryCatch` wrapper, returns appropriate status codes.
  - Export types: `FeedGetQueryParams`, `FeedGetResponseBody`.
- Follow existing API route patterns (error handling, type exports).

### 5. Add Unit Tests for Feed Operations
- Create test file for `tileOperations.getFeed`:
  - Test score calculation correctness (recency, quality, social proof).
  - Test cursor pagination:
    - First page (no cursor) returns correct tiles.
    - Subsequent pages (with cursor) return next set.
    - No duplicates across pages.
    - No skipped tiles.
    - `hasNextPage` correctly indicates more pages.
  - Test save count aggregation.
  - Test `isSaved` state inclusion when `authUserId` provided.
  - Test public tiles only (`isPrivate = false`).
- Use existing test patterns and fixtures.

### 6. Add Integration Test for Feed API Route
- Create integration test for `/api/feed` route:
  - Test auth handling (with/without auth user).
  - Test cursor pagination via API.
  - Test response format matches `FeedGetResponseBody`.
  - Test error handling (invalid cursor, etc.).
- Verify response includes correct headers and status codes.

### 7. Manual QA & Performance Check
- Manually test the API endpoint:
  - Verify tiles are correctly scored and ordered.
  - Test pagination: fetch page 1, then page 2, verify no duplicates/skips.
  - Test with authenticated and unauthenticated users.
  - Verify `isSaved` state works correctly for authenticated users.
- Check query performance: ensure query time < 200ms for 20 tiles.
- Verify cursor encoding/decoding works correctly in URLs.

