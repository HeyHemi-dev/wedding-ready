# Tile Feed Feature Plan

## Objective
- Deliver a personalized `/feed` experience that continuously surfaces relevant tiles.
- Keep UX responsive via Suspense-driven data fetching, skeletons, and infinite scroll.

## Success Criteria
- Scroll never blocks; next page fetched before sentinel enters viewport.
- Sorting reflects freshness + quality + social proof (saves).

## Source Material
- `tileOperations.getListForUser`/`getListForSupplier` for querying Tiles.
- `TileList` & `TileListSkeleton` for existing presentation primitives.
- `useTileCredit` as reference for Suspense + React Query + optimistic updates.

## High-Level Architecture
1. **Server layer**
   - Add `tileOperations.getFeed({ authUserId, cursor, limit })` that:
     - Combines multiple rankings: recency, quality score (title + description + credits), save count.
     - Returns ordered tiles + `nextCursor` + `hasNextPage`.
     - Aggregates save counts via SQL `COUNT` on `saved_tiles` where `isSaved = true`.
   - Expose via `/api/feed` route handler (REST API for infinite query compatibility).
2. **Page Entry (`src/app/feed/page.tsx`)**
   - Server component that:
     - Resolves auth user (optional - can show public feed).
     - Prefetches first page via `tileOperations.getFeed`.
     - Wraps a `<Suspense fallback={<TileFeedSkeleton />}>` around client shell.
3. **Client Shell (`FeedClient` in `app/feed/feed-client.tsx`)**
   - `'use client'`; owns intersection observer + `useSuspenseInfiniteQuery`.
   - Injects dehydrated initial page using `HydrationBoundary`.
   - Integrates `use-magic-grid` for masonry layout.
4. **Presentation**
   - Create `TileFeedMasonry` component that wraps `use-magic-grid` around `TileListItem` components.
   - Add `TileFeedSkeleton` that mimics staggered masonry heights while loading.

## Data Fetching & Caching
- Query key: `queryKeys.feed(authUserId)`.
- Use `useSuspenseInfiniteQuery` with:
  - `initialPageParam: null`.
  - `getNextPageParam: (last) => last.nextCursor ?? undefined`.
  - `staleTime: 60s` to allow fast back/forward.
- Server prefetch flow:
  ```typescript
  const queryClient = getQueryClient()
  const initialData = await queryClient.fetchInfiniteQuery({
    queryKey: queryKeys.feed(authUserId),
    queryFn: ({ pageParam }) => fetchFeed(authUserId, pageParam),
    initialPageParam: null,
  })
  ```
- Revalidate feed (React Query cache) when tile is saved/created via `queryClient.invalidateQueries`.

## Infinite Scroll Strategy
- Place `IntersectionObserver` sentinel after the final masonry container.
- Use a dedicated hook `useInfiniteScroll({ onIntersect, disabled })` that:
  - Uses `useRef` for sentinel element.
  - Uses `useEffect` + `IntersectionObserver` API.
  - Cleans up observer on unmount.
- Guard against duplicate fetches:
  - Only call `fetchNextPage` when `hasNextPage && !isFetchingNextPage`.
- When sentinel hits:
  - Trigger `startTransition` for non-blocking updates.
  - Call `fetchNextPage()` from infinite query.

## Skeleton & Loading UX
- First page: use `<TileFeedSkeleton />` inside Suspense fallback (masonry-style staggered heights).
- Subsequent pages: show inline skeleton items appended below current tiles while `isFetchingNextPage`.
- Empty state: use `noTiles` component with CTA to explore suppliers or upload.
- Masonry layout: skeleton items should have varied heights to mimic real tile aspect ratios.

## Sorting Algorithm Sketch
1. **Base query**: fetch public tiles (`isPrivate = false`) with:
   - LEFT JOIN to count credits per tile.
   - LEFT JOIN to count saves per tile (`COUNT(saved_tiles) WHERE isSaved = true`).
   - Calculate quality score in SQL: `CASE WHEN title IS NOT NULL THEN 1 ELSE 0 END + CASE WHEN description IS NOT NULL THEN 1 ELSE 0 END + CASE WHEN credit_count > 0 THEN 1 ELSE 0 END`.
2. **Score calculation (SQL)**:
   - `score = recencyWeight * (1 / (EXTRACT(EPOCH FROM (NOW() - createdAt)) / 86400 + 1)) + qualityWeight * qualityScore + socialWeight * LOG(save_count + 1)`.
   - Weights: `recencyWeight = 0.4`, `qualityWeight = 0.3`, `socialWeight = 0.3` (tunable).
3. **Ordering**: `ORDER BY score DESC, createdAt DESC`.
4. **Cursor**: use `(score, createdAt, id)` tuple for deterministic pagination (ensures no duplicates/skips).

## Prefetch Strategy
- As soon as page loads, prefetch page 2 (if available) using `queryClient.prefetchInfiniteQuery`.
- When user navigates away (e.g., to tile detail), leverage [React Query keep-alive] to keep feed cached for quick return.

## Error Handling
- Distinguish between recoverable network errors vs. empty feed.
- Show inline `Retry` button wired to `refetch`.
- Log to monitoring (future step).

## Implementation Checklist

### Database & Operations Layer
- [ ] Add `tileOperations.getFeed({ authUserId, cursor, limit })` in `src/operations/tile-operations.ts`:
  - [ ] SQL query with LEFT JOINs for credit counts and save counts.
  - [ ] Calculate quality score in SQL (title + description + credits presence).
  - [ ] Calculate composite score (recency + quality + social).
  - [ ] Implement cursor-based pagination using `(score, createdAt, id)` tuple.
  - [ ] Return `{ tiles: TileListItem[], nextCursor: string | null, hasNextPage: boolean }`.
  - [ ] Include `isSaved` state for each tile if `authUserId` provided.
- [ ] **Database optimization consideration**: 
  - Initially: compute save counts on-the-fly via SQL aggregation (acceptable for MVP).
  - Future: add `save_count` column to `tiles` table + cron job to update periodically (if performance degrades).
  - No cron job needed for MVP; monitor query performance first.

### API Layer
- [ ] Create `/api/feed/route.ts`:
  - [ ] GET handler that accepts `cursor` and `limit` query params.
  - [ ] Resolve `authUserId` from session (optional).
  - [ ] Call `tileOperations.getFeed`.
  - [ ] Return JSON: `{ tiles, nextCursor, hasNextPage }`.
  - [ ] Add TypeScript types: `FeedGetResponseBody`, `FeedGetQueryParams`.

### Hooks & Client Components
- [ ] Install `use-magic-grid`: `pnpm install use-magic-grid`.
- [ ] Create `src/app/_hooks/use-feed.ts`:
  - [ ] `useSuspenseInfiniteQuery` with proper query key, initial page param, getNextPageParam.
  - [ ] Fetch function that calls `/api/feed` with cursor.
  - [ ] Return flattened tiles array, `fetchNextPage`, `hasNextPage`, `isFetchingNextPage`.
- [ ] Create `src/app/_hooks/use-infinite-scroll.ts`:
  - [ ] Custom hook that sets up IntersectionObserver on sentinel element.
  - [ ] Accepts `onIntersect` callback and `disabled` flag.
  - [ ] Returns `sentinelRef` to attach to DOM element.
- [ ] Create `src/app/feed/feed-client.tsx`:
  - [ ] `'use client'` component.
  - [ ] Uses `useFeed` hook.
  - [ ] Uses `useInfiniteScroll` to trigger `fetchNextPage` when sentinel visible.
  - [ ] Renders `TileFeedMasonry` with all tiles.
  - [ ] Shows `TileFeedSkeleton` when `isFetchingNextPage`.
  - [ ] Handles empty state with `noTiles` component.
- [ ] Create `src/components/tiles/tile-feed-masonry.tsx`:
  - [ ] Wraps `use-magic-grid` hook.
  - [ ] Accepts `tiles: TileListItem[]` prop.
  - [ ] Renders each tile as `TileListItem` inside masonry container.
  - [ ] Handles re-layout when new tiles added (magic-grid should handle this).
- [ ] Create `src/components/tiles/tile-feed-skeleton.tsx`:
  - [ ] Masonry-style skeleton with varied heights (mimic aspect-[2/3] tiles).
  - [ ] Use `use-magic-grid` for consistent layout with real tiles.

### Page Component
- [ ] Update `src/app/feed/page.tsx`:
  - [ ] Server component that resolves auth user.
  - [ ] Prefetches first page using `getQueryClient().fetchInfiniteQuery`.
  - [ ] Wraps `FeedClient` in `<Suspense>` with `TileFeedSkeleton` fallback.
  - [ ] Uses `HydrationBoundary` to inject prefetched data.

### Query Keys
- [ ] Add `feed: (authUserId: string | null) => ['feed', authUserId]` to `src/app/_types/keys.ts`.

### Testing & QA
- [ ] Unit tests for `tileOperations.getFeed`:
  - [ ] Score calculation correctness.
  - [ ] Cursor pagination (no duplicates, proper ordering).
  - [ ] Save count aggregation.
- [ ] Integration test for `/api/feed` route.
- [ ] Manual QA:
  - [ ] Infinite scroll triggers correctly.
  - [ ] Masonry layout reflows when new tiles load.
  - [ ] Skeleton shows during loading.
  - [ ] Empty state displays when no tiles.
  - [ ] Performance: query time < 200ms for 20 tiles.

## Edge Cases & Open Questions
- ✅ **Feed scope**: All public tiles (not personalized yet - can add later).
- ✅ **Auth**: `authUserId` optional - show public feed if not logged in.
- ✅ **Save counts**: Compute on-the-fly via SQL aggregation (no cron job needed initially).
- ⚠️ **Page size**: Default 20 tiles per page (adjust based on masonry layout performance).
- ⚠️ **Tiles without images**: Filter out or handle gracefully? (Verify `imagePath` is always present in schema).
- ⚠️ **Masonry performance**: Monitor reflow performance with `use-magic-grid` on large feeds (100+ tiles).

## Architecture Decision: `tileOperations` vs `feedOperations`
**Decision**: Add `getFeed` to `tileOperations` rather than creating separate `feedOperations`.
- **Rationale**: Feed is just a specialized tile query with scoring/pagination. No other feed operations anticipated.
- **Location**: `src/operations/tile-operations.ts`
- **Export**: Add to `tileOperations` object: `getFeed`

## Masonry Layout with `use-magic-grid`

### Library Integration
- **Package**: `use-magic-grid` (install via `pnpm install use-magic-grid`).
- **Why**: Automatic masonry layout that handles dynamic content and reflows efficiently.

### Implementation Notes
- **Container**: Wrap all `TileListItem` components in a container that `use-magic-grid` manages.
- **Item sizing**: Each tile has `aspect-[2/3]` ratio, but actual rendered heights vary based on image content.
- **Re-layout triggers**: Magic grid should automatically reflow when:
  - New tiles are added (infinite scroll).
  - Window is resized.
  - Images finish loading (if using natural image dimensions).
- **Performance**: Monitor reflow performance with 100+ tiles. Consider virtualizing if needed (future optimization).

### Component Structure
```typescript
// tile-feed-masonry.tsx
'use client'
import { useMagicGrid } from 'use-magic-grid'
import { TileListItem } from './tile-list-item'

export function TileFeedMasonry({ tiles }: { tiles: TileListItem[] }) {
  const { containerRef } = useMagicGrid({
    items: tiles.length,
    // Configure column width, gap, etc.
  })
  
  return (
    <div ref={containerRef}>
      {tiles.map(tile => (
        <TileListItem key={tile.id} tile={tile} />
      ))}
    </div>
  )
}
```

### Skeleton Considerations
- Skeleton items should match the masonry layout structure.
- Use varied heights to mimic real tile aspect ratios.
- Ensure skeleton container uses same grid configuration as real tiles.

