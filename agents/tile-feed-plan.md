# Tile Feed Feature 

## Overview

Add an infinite-scrolling feed of tiles on `/feed` that surfaces relevant content based on a composite scoring algorithm. The feed uses a masonry layout, Suspense-driven data fetching, and view-based pagination (tiles are marked as viewed and won't appear again for 7 days) for optimal performance and UX.

## Current Architecture Review

### Layer Responsibilities

| Layer | Responsibilities / What it owns | Current Implementation (Feed Context) |
| --- | --- | --- |
| **Presentation/UI** | UI layout, presentational components | `TileFeedMasonry` (does not exist), `TileFeedSkeleton` (does not exist), `TileListItem` (existing - can reuse) |
| **Presentation/Client-side Logic** | Animations, state, data formatting, component state, effects, user interactions | `FeedClient` component (does not exist) |
| **Presentation/Client-side Boundary** | UX, error handling, data fetching hooks, React Query integration, cache management | `useFeed` hook (does not exist), `useInfiniteScroll` hook (does not exist) |
| **Presentation/Server-side Boundary** | Authentication, headers/cookies, Zod parsing, SSR data fetching, API endpoints | `page.tsx` (placeholder - only shows skeleton), `/api/feed/route.ts` (✅ implemented) |
| **Operations** | Authorization, data integrity, type conversion, business logic orchestration, multi-model coordination | `tileOperations.getFeedForUser` (✅ implemented) |
| **Data/Access** | CRUD operations, set dates, database queries | `tileModel`, `savedTilesModel`, `tileSupplierModel` (existing - can reuse) |
| **Data/Definition** | Data shape definition, schema, constants, types, migrations | `db/schema.ts`, `app/_types/tiles.ts` (existing - can reuse) |

### Current State of `/feed` Page

The current `app/feed/page.tsx` is a placeholder that:
- Renders `<TileListSkeleton />` inside a `<Section>`.
- Does not fetch any data.
- Does not have any client components.
- Does not implement any feed functionality.

**Everything needs to be built from scratch.**

### Current Flow (Existing Tile Lists - Reference Pattern)

For comparison, existing tile list pages (e.g., user tiles, supplier tiles) follow this pattern:

1. **Server-side Boundary**: Server component or API route calls `tileOperations.getListForUser` or `getListForSupplier`.
2. **Operations**: Queries database via models, aggregates saved states if `authUserId` provided.
3. **Operations**: Returns `TileListItem[]` with `isSaved` state.
4. **Client-side Boundary**: Custom hook (`useUserTiles`, `useSupplierTiles`) fetches from API, manages React Query cache.
5. **Client-side Boundary (Cache optimization)**: After fetching tiles, calls `setTilesSaveStateCache(queryClient, tiles, authUserId)` to pre-populate the React Query cache for each tile's save state. This allows individual tile components using `useTileSaveState` to read from cache via `initialData` instead of making separate API calls.
6. **Client-side Logic**: Component uses hook, handles loading/error states.
7. **UI**: `TileList` renders tiles in grid layout.

## Feature Requirements

### Core Functionality
- Infinite scroll feed of public tiles sorted by composite score (recency + quality + social proof).
- Masonry layout using `use-magic-grid` library.
- View-based pagination: tiles are marked as viewed when returned and won't appear again for 7 days (prevents duplicates).
- Suspense-driven initial load with skeleton fallback.
- Prefetch next page for seamless scrolling.

### Scoring Algorithm
- **Recency**: Decays from 1.0 to 0.0 over 7 days. Tiles less than 5 minutes old get max score (1.0).
- **Quality**: Based on presence of title (0.1), description (0.1), and credits (0-0.8 based on credit count).
- **Social Proof**: Based on save count using exponential decay formula (approaches 1.0 as saves increase).
- **Weights**: Recency (0.3), Quality (0.2), Social (0.5).
- Composite score is **denormalized** and stored in `tiles.score` column (real type, 0-1 range).
- Score is updated via `updateScore()` function when tiles are created/updated or when credits/saves change.

### User Experience
- First paint shows skeleton matching masonry layout.
- Scroll never blocks; next page loads before user reaches bottom.
- Loading states for subsequent pages (inline skeletons).
- Empty state with CTA when no tiles available.
- **Auth required**: Feed requires authentication. Each user gets a personalized feed based on their view history and saved tiles.

## Integration Plan

### Data/Definition Layer
- **Schema changes**:
  - Added `score` column (real type, 0-1 range) to `tiles` table for denormalized composite score.
  - Added `scoreUpdatedAt` timestamp to track when score was last calculated.
  - Added `viewedTiles` table to track which tiles have been shown to users (prevents duplicates for 7 days).

### Data/Access Layer
- **No changes needed**: Existing `tileModel`, `savedTilesModel`, and `tileSupplierModel` provide required CRUD operations.

### Operations Layer

**`tileOperations.getFeedForUser(authUserId, { pageSize })`** ✅ **IMPLEMENTED**
- Operation that:
  - Calls `tileModel.getFeed(authUserId, { limit })` which:
    - Queries public tiles (`isPrivate = false`) ordered by `score DESC`.
    - Filters out tiles viewed by user in last 7 days (LEFT JOIN on `viewedTiles`).
    - Filters out saved tiles (LEFT JOIN on `savedTiles` where `isSaved = true`).
    - Returns up to `limit` tiles.
    - Marks returned tiles as viewed in a transaction (updates `viewedTiles` table).
  - Maps results to `TileListItem[]` with `isSaved: false` (saved tiles already filtered out).
  - Determines `hasNextPage` by checking if returned tiles count equals requested `pageSize`.
  - Returns `{ tiles: TileListItem[], hasNextPage: boolean }`.
  - **Note**: No cursor needed - view tracking handles pagination automatically.

**`updateScore(tileId)`** ✅ **IMPLEMENTED** (in `feed-helpers.ts`)
- Function that:
  - Fetches tile, credit count, and save count.
  - Calculates composite score using `calculateScore()` function.
  - Updates `tiles.score` column in database.
  - Should be called when tiles are created/updated or when credits/saves change.

### Presentation/Server-side Boundary Layer

**`/api/feed/route.ts`** ✅ **IMPLEMENTED**
- GET endpoint that:
  - Accepts `pageSize` query parameter (Zod validation, required, positive integer).
  - Resolves `authUserId` from session (**required** - returns 401 if not authenticated).
  - Calls `tileOperations.getFeedForUser(authUserId, { pageSize })`.
  - Returns JSON: `{ tiles, hasNextPage }`.
  - Exports TypeScript types: `FeedGetResponseBody`, `FeedGetRequestParams`.
- Follows existing API route patterns (error handling, tryCatch wrapper).

**`page.tsx` (`app/feed/page.tsx`)**
- **Current state**: Placeholder that only renders `<TileListSkeleton />`.
- **To be implemented**: Server component that:
  - Resolves auth user (**required**) via `getAuthUserId()` (redirect to login if not authenticated).
  - Prefetches first page using `getQueryClient().fetchInfiniteQuery`.
  - Wraps `FeedClient` in `<Suspense>` with `TileFeedSkeleton` fallback.
  - Uses `HydrationBoundary` to inject prefetched data.

### Presentation/Client-side Boundary Layer

**`useFeed(authUserId)` (`app/_hooks/use-feed.ts`)**
- Custom hook wrapping `useSuspenseInfiniteQuery`:
  - Query key: `['feed', authUserId]`.
  - Fetches from `/api/feed` with `pageSize` parameter (no cursor needed).
  - After fetching, calls `setTilesSaveStateCache(queryClient, tiles, authUserId)` to pre-populate save state cache for efficient `useTileSaveState` lookups (following pattern from `useSupplierTiles`).
  - Returns flattened tiles array, `fetchNextPage`, `hasNextPage`, `isFetchingNextPage`.
  - Configured with `staleTime: 60s` for fast back/forward navigation.
  - **Note**: Each page request automatically gets the next batch of unviewed tiles (view tracking handles pagination).

**`useInfiniteScroll({ onIntersect, disabled })` (`app/_hooks/use-infinite-scroll.ts`)**
- Custom hook for IntersectionObserver:
  - Sets up observer on sentinel element.
  - Calls `onIntersect` when sentinel enters viewport.
  - Returns `sentinelRef` for DOM attachment.
  - Handles cleanup on unmount.

### Presentation/Client-side Logic Layer

**`FeedClient` (`app/feed/feed-client.tsx`)**
- Client component (`'use client'`) that:
  - Uses `useFeed` for data fetching.
  - Uses `useInfiniteScroll` to trigger `fetchNextPage` when sentinel visible.
  - Manages loading states and error handling.
  - Renders `TileFeedMasonry` with all tiles.
  - Shows `TileFeedSkeleton` when `isFetchingNextPage`.
  - Handles empty state with `noTiles` component.

### Presentation/UI Layer

**`TileFeedMasonry` (`components/tiles/tile-feed-masonry.tsx`)**
- Presentational component that:
  - Wraps `use-magic-grid` library.
  - Accepts `tiles: TileListItem[]` prop.
  - Renders each tile as `TileListItem` inside masonry container.
  - Handles automatic reflow when new tiles added.

**`TileFeedSkeleton` (`components/tiles/tile-feed-skeleton.tsx`)**
- Presentational skeleton loader:
  - Varied heights to mimic real tile aspect ratios.
  - Uses same grid configuration as `TileFeedMasonry`.
  - Shows during initial Suspense fallback and subsequent page loads.

**`TileListItem` (existing)**
- Reuse existing component for individual tile rendering.

## Implementation Considerations

### Database Performance
- **Current implementation** ✅:
  - Score is **denormalized** in `tiles.score` column (real type, 0-1 range).
  - Score is calculated via `updateScore()` function and stored in database.
  - `getFeed` query:
    - Orders by `score DESC` directly in SQL (can use index).
    - Filters in SQL using LEFT JOINs on `viewedTiles` and `savedTiles`.
    - Returns exactly `limit` tiles (no client-side filtering needed).
    - Marks tiles as viewed in same transaction.
  - **Performance characteristics**:
    - Single SQL query with efficient JOINs.
    - Database handles sorting and filtering.
    - No client-side scoring or sorting.
    - Scales well as database grows.
- **Optimization ideas** (if performance becomes an issue):
  - **Index on score**: Add index on `tiles(score DESC)` to optimize sorting.
  - **Index on viewedTiles**: Ensure `viewedTiles(userId, viewedAt DESC)` index exists for efficient filtering.
  - **Score update strategy**: Consider batch updates or triggers to keep scores fresh.
  - **Query optimization**: Monitor query execution plans, add indexes as needed.

### Masonry Layout
- **Library**: `use-magic-grid` handles dynamic content and automatic reflows.
- **Performance**: Monitor reflow performance with 100+ tiles. Consider virtualization if needed (future optimization).
- **Item sizing**: Remove `aspect-[2/3]` ratio from tile, rendered heights vary based on image content. Consider having image aspect ratio in tile schema (calculated at upload) if setting an aspect ratio works with magic grid.

### View-Based Pagination
- **View tracking**: Tiles are marked as viewed when returned to user (stored in `viewedTiles` table).
- **7-day window**: Tiles won't appear again for 7 days after being viewed.
- **Pagination logic**: 
  - Each request returns next batch of unviewed tiles (ordered by score).
  - `hasNextPage` is `true` if returned tiles count equals requested `pageSize`.
  - No cursor needed - view tracking automatically handles pagination.
- **Benefits**:
  - Prevents duplicates across pages.
  - Simple implementation (no cursor encoding/decoding).
  - Natural "infinite scroll" behavior (each request gets next batch).
- **Edge cases**: 
  - If user has viewed all available tiles, returns empty array with `hasNextPage: false`.
  - After 7 days, tiles become available again (viewedAt expires).

### Caching Strategy
- **React Query**: 60s stale time for fast back/forward navigation.
- **Prefetching**: Prefetch page 2 on initial load for seamless scrolling.
- **Invalidation**: Invalidate feed cache when tiles are saved/created (via `queryClient.invalidateQueries`).

### Error Handling
- **Network errors**: Show inline retry button wired to `refetch`.
- **Empty feed**: Display `noTiles` component with CTA.
- **Loading states**: Distinguish between initial Suspense fallback and subsequent page loading.

## Ticket Breakdown

### Ticket 1 · Core Feed Operations & API (Plumbing) ✅ **COMPLETED**
**Goal**: Get the backend feed functionality working with scoring algorithm and view-based pagination.

**Tasks** (✅ Completed):
- ✅ Added `tileModel.getFeed(authUserId, { limit })`:
  - SQL query with LEFT JOINs on `viewedTiles` and `savedTiles`.
  - Filters out tiles viewed in last 7 days and saved tiles.
  - Orders by `score DESC` (denormalized score column).
  - Marks returned tiles as viewed in transaction.
  - Returns `TileRaw[]`.
- ✅ Added `tileOperations.getFeedForUser(authUserId, { pageSize })`:
  - Calls `tileModel.getFeed`.
  - Maps to `TileListItem[]` with `isSaved: false` (saved tiles already filtered).
  - Determines `hasNextPage` by checking if returned count equals `pageSize`.
  - Returns `{ tiles: TileListItem[], hasNextPage: boolean }`.
- ✅ Created `/api/feed/route.ts`:
  - GET handler with Zod validation for `pageSize` query param (required).
  - Requires `authUserId` (returns 401 if not authenticated).
  - Calls `tileOperations.getFeedForUser`.
  - Returns JSON response with proper types.
  - Exports TypeScript types: `FeedGetResponseBody`, `FeedGetRequestParams`.
- ✅ Added `feed` query key to `src/app/_types/keys.ts`.
- ✅ Added `updateScore(tileId)` function in `feed-helpers.ts`:
  - Calculates composite score using `calculateScore()`.
  - Updates `tiles.score` column in database.
- ✅ Schema changes:
  - Added `score` column (real type) to `tiles` table.
  - Added `scoreUpdatedAt` timestamp.
  - Added `viewedTiles` table for view tracking.
- ✅ Unit tests for `tileOperations.getFeedForUser`:
  - No duplicate tiles across pages.
  - Correct `hasNextPage` logic.
- ✅ Integration test for `/api/feed` route.

**Acceptance**: ✅ API endpoint returns correctly scored and paginated tiles. View-based pagination works without duplicates. Score is denormalized in database.

---

### Ticket 2 · Basic Feed Client with Infinite Scroll (Grid Layout)
**Goal**: Get infinite scroll working end-to-end with existing `TileList` component.

**Tasks**:
- Create `useFeed(authUserId)` hook (`app/_hooks/use-feed.ts`):
  - Wrap `useSuspenseInfiniteQuery` with proper query key.
  - Fetch from `/api/feed` with `pageSize` parameter (no cursor needed).
  - Call `setTilesSaveStateCache` after fetching (cache optimization).
  - Return flattened tiles array, `fetchNextPage`, `hasNextPage`, `isFetchingNextPage`.
  - Configure `staleTime: 60s`.
  - **Note**: Each page automatically gets next batch of unviewed tiles.
- Create `useInfiniteScroll({ onIntersect, disabled })` hook (`app/_hooks/use-infinite-scroll.ts`):
  - Set up IntersectionObserver on sentinel element.
  - Call `onIntersect` when sentinel enters viewport.
  - Return `sentinelRef` for DOM attachment.
  - Handle cleanup on unmount.
- Create `FeedClient` component (`app/feed/feed-client.tsx`):
  - Use `useFeed` for data fetching.
  - Use `useInfiniteScroll` to trigger `fetchNextPage`.
  - Render `TileList` with all tiles (flattened from pages).
  - Show `TileListSkeleton` when `isFetchingNextPage`.
  - Handle empty state with `noTiles` component.
  - Add sentinel element after tile list for intersection observer.
- Update `page.tsx` (`app/feed/page.tsx`):
  - Resolve auth user (**required**) via `getAuthUserId()` (redirect to login if not authenticated).
  - Prefetch first page using `getQueryClient().fetchInfiniteQuery`.
  - Wrap `FeedClient` in `<Suspense>` with `TileListSkeleton` fallback.
  - Use `HydrationBoundary` to inject prefetched data.

**Acceptance**: Feed page loads with infinite scroll working. Tiles display in grid layout. Next page loads when scrolling to bottom. Save state cache works correctly.

---

### Ticket 3 · Masonry Layout Integration
**Goal**: Replace grid layout with masonry layout using `use-magic-grid`.

**Tasks**:
- Install `use-magic-grid`: `pnpm install use-magic-grid`.
- Create `TileFeedMasonry` component (`components/tiles/tile-feed-masonry.tsx`):
  - Wrap `use-magic-grid` hook.
  - Accept `tiles: TileListItem[]` prop.
  - Render each tile as `TileListItem` inside masonry container.
  - Configure column width, gap, etc. to match design.
  - Handle automatic reflow when new tiles added.
- Create `TileFeedSkeleton` component (`components/tiles/tile-feed-skeleton.tsx`):
  - Masonry-style skeleton with varied heights.
  - Mimic real tile aspect ratios (remove fixed `aspect-[2/3]`).
  - Use same grid configuration as `TileFeedMasonry`.
- Update `TileListItem` to remove `aspect-[2/3]` constraint (if needed for masonry).
- Update `FeedClient`:
  - Replace `TileList` with `TileFeedMasonry`.
  - Replace `TileListSkeleton` with `TileFeedSkeleton` for loading states.
- Update `page.tsx`:
  - Replace `TileListSkeleton` fallback with `TileFeedSkeleton`.

**Acceptance**: Feed displays in masonry layout. Skeleton matches masonry structure. Layout reflows correctly when new tiles load. Performance is acceptable with 100+ tiles.

---

## Implementation Order Rationale

**Phase 1 (Tickets 1-2)**: Core functionality with simple grid
- Validates scoring algorithm and pagination
- Gets end-to-end flow working
- Easier to debug without masonry complexity
- Can test and iterate on algorithm

**Phase 2 (Ticket 3)**: UI enhancement with masonry
- Builds on working foundation
- Isolated UI change
- Can test masonry performance separately
- Lower risk if masonry has issues
