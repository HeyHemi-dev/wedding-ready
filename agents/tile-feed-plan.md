# Tile Feed Feature 

## Overview

Add an infinite-scrolling feed of tiles on `/feed` that surfaces relevant content based on a composite scoring algorithm. The feed uses a masonry layout, Suspense-driven data fetching, and cursor-based pagination for optimal performance and UX.

## Current Architecture Review

### Layer Responsibilities

| Layer | Responsibilities / What it owns | Current Implementation (Feed Context) |
| --- | --- | --- |
| **Presentation/UI** | UI layout, presentational components | `TileFeedMasonry` (does not exist), `TileFeedSkeleton` (does not exist), `TileListItem` (existing - can reuse) |
| **Presentation/Client-side Logic** | Animations, state, data formatting, component state, effects, user interactions | `FeedClient` component (does not exist) |
| **Presentation/Client-side Boundary** | UX, error handling, data fetching hooks, React Query integration, cache management | `useFeed` hook (does not exist), `useInfiniteScroll` hook (does not exist) |
| **Presentation/Server-side Boundary** | Authentication, headers/cookies, Zod parsing, SSR data fetching, API endpoints | `page.tsx` (placeholder - only shows skeleton), `/api/feed/route.ts` (does not exist) |
| **Operations** | Authorization, data integrity, type conversion, business logic orchestration, multi-model coordination | `tileOperations.getFeed` (does not exist) |
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
- Cursor-based pagination to prevent duplicates and ensure deterministic ordering.
- Suspense-driven initial load with skeleton fallback.
- Prefetch next page for seamless scrolling.

### Scoring Algorithm
- **Recency**: Weighted by time since creation (newer = higher score) with log decay.
- **Quality**: Based on presence of title, description, and multi-credits (complete tiles score higher).
- **Social Proof**: Based on save count (more saves = higher score).
- Composite score calculated in SQL.

### User Experience
- First paint shows skeleton matching masonry layout.
- Scroll never blocks; next page loads before user reaches bottom.
- Loading states for subsequent pages (inline skeletons).
- Empty state with CTA when no tiles available.
- Auth-optional: show public feed if not logged in, personalized `isSaved` state if authenticated.

## Integration Plan

### Data/Definition Layer
- **No changes needed**: Existing schema, types, and constants support feed requirements.

### Data/Access Layer
- **No changes needed**: Existing `tileModel`, `savedTilesModel`, and `tileSupplierModel` provide required CRUD operations.

### Operations Layer

**`tileOperations.getFeed({ authUserId, cursor, limit })`**
- New operation that:
  - Queries public tiles (`isPrivate = false`) with LEFT JOINs for credit counts and save counts.
  - Calculates quality score in SQL (title + description + credits presence).
  - Computes composite score combining recency, quality, and social proof weights.
  - Implements cursor-based pagination using `(score, createdAt, id)` tuple.
  - Returns `{ tiles: TileListItem[], nextCursor: string | null, hasNextPage: boolean }`.
  - Includes `isSaved` state per tile if `authUserId` provided.

### Presentation/Server-side Boundary Layer

**`/api/feed/route.ts`**
- New GET endpoint that:
  - Accepts `cursor` and `limit` query parameters (Zod validation).
  - Resolves `authUserId` from session (optional).
  - Calls `tileOperations.getFeed`.
  - Returns JSON: `{ tiles, nextCursor, hasNextPage }`.
  - Exports TypeScript types: `FeedGetResponseBody`, `FeedGetQueryParams`.
- Follows existing API route patterns (error handling, tryCatch wrapper).

**`page.tsx` (`app/feed/page.tsx`)**
- **Current state**: Placeholder that only renders `<TileListSkeleton />`.
- **To be implemented**: Server component that:
  - Resolves auth user (optional) via `getAuthUserId()`.
  - Prefetches first page using `getQueryClient().fetchInfiniteQuery`.
  - Wraps `FeedClient` in `<Suspense>` with `TileFeedSkeleton` fallback.
  - Uses `HydrationBoundary` to inject prefetched data.

### Presentation/Client-side Boundary Layer

**`useFeed(authUserId)` (`app/_hooks/use-feed.ts`)**
- Custom hook wrapping `useSuspenseInfiniteQuery`:
  - Query key: `['feed', authUserId]`.
  - Fetches from `/api/feed` with cursor pagination.
  - After fetching, calls `setTilesSaveStateCache(queryClient, tiles, authUserId)` to pre-populate save state cache for efficient `useTileSaveState` lookups (following pattern from `useSupplierTiles`).
  - Returns flattened tiles array, `fetchNextPage`, `hasNextPage`, `isFetchingNextPage`.
  - Configured with `staleTime: 60s` for fast back/forward navigation.

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
- **Save counts**: Initially computed on-the-fly via SQL aggregation (acceptable for MVP).
- **Future optimization**: If performance degrades, add `save_count` column to `tiles` table with periodic cron job updates.
- **Query optimization**: Use indexed columns (`createdAt`, `isPrivate`) and efficient JOINs.

### Masonry Layout
- **Library**: `use-magic-grid` handles dynamic content and automatic reflows.
- **Performance**: Monitor reflow performance with 100+ tiles. Consider virtualization if needed (future optimization).
- **Item sizing**: Remove `aspect-[2/3]` ratio from tile, rendered heights vary based on image content. Consider having image aspect ratio in tile schema (calculated at upload) if setting an aspect ratio works with magic grid.

### Cursor Pagination
- **Cursor format**: `(score, createdAt, id)` tuple ensures deterministic ordering and prevents duplicates/skips.
- **Encoding**: Base64 or JSON-encoded string for URL-safe transmission.
- **Edge cases**: Handle null cursor (first page), last page detection, cursor invalidation.

### Caching Strategy
- **React Query**: 60s stale time for fast back/forward navigation.
- **Prefetching**: Prefetch page 2 on initial load for seamless scrolling.
- **Invalidation**: Invalidate feed cache when tiles are saved/created (via `queryClient.invalidateQueries`).

### Error Handling
- **Network errors**: Show inline retry button wired to `refetch`.
- **Empty feed**: Display `noTiles` component with CTA.
- **Loading states**: Distinguish between initial Suspense fallback and subsequent page loading.

## Ticket Breakdown

### Ticket 1 · Core Feed Operations & API (Plumbing)
**Goal**: Get the backend feed functionality working with scoring algorithm and cursor pagination.

**Tasks**:
- Add `tileOperations.getFeed({ authUserId, cursor, limit })`:
  - SQL query with LEFT JOINs for credit counts and save counts.
  - Calculate quality score in SQL (title + description + credits presence).
  - Calculate composite score (recency + quality + social proof) with weights.
  - Implement cursor-based pagination using `(score, createdAt, id)` tuple.
  - Encode/decode cursor (Base64 or JSON).
  - Return `{ tiles: TileListItem[], nextCursor: string | null, hasNextPage: boolean }`.
  - Include `isSaved` state per tile if `authUserId` provided.
- Create `/api/feed/route.ts`:
  - GET handler with Zod validation for `cursor` and `limit` query params.
  - Resolve `authUserId` from session (optional).
  - Call `tileOperations.getFeed`.
  - Return JSON response with proper types.
  - Add TypeScript exports: `FeedGetResponseBody`, `FeedGetQueryParams`.
- Add `feed` query key to `src/app/_types/keys.ts`.
- Unit tests for `tileOperations.getFeed`:
  - Score calculation correctness.
  - Cursor pagination (no duplicates, proper ordering).
  - Save count aggregation.
- Integration test for `/api/feed` route.

**Acceptance**: API endpoint returns correctly scored and paginated tiles. Cursor pagination works without duplicates/skips.

---

### Ticket 2 · Basic Feed Client with Infinite Scroll (Grid Layout)
**Goal**: Get infinite scroll working end-to-end with existing `TileList` component.

**Tasks**:
- Create `useFeed(authUserId)` hook (`app/_hooks/use-feed.ts`):
  - Wrap `useSuspenseInfiniteQuery` with proper query key.
  - Fetch from `/api/feed` with cursor pagination.
  - Call `setTilesSaveStateCache` after fetching (cache optimization).
  - Return flattened tiles array, `fetchNextPage`, `hasNextPage`, `isFetchingNextPage`.
  - Configure `staleTime: 60s`.
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
  - Resolve auth user (optional) via `getAuthUserId()`.
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
