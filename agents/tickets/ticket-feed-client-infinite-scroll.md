# Ticket: Basic Feed Client with Infinite Scroll (Grid Layout)

## Goal
Get infinite scroll working end-to-end with existing `TileList` component. Implement the client-side data fetching, infinite scroll hook, and feed client component. Source of truth: `agents/tile-feed-plan.md` (Ticket 2).

## Commit Steps

### 1. Create useFeed Hook
- Create `src/app/_hooks/use-feed.ts`:
  - Import `useSuspenseInfiniteQuery`, `useQueryClient` from `@tanstack/react-query`.
  - Import `setTilesSaveStateCache` from `@/app/_hooks/use-tile-saved-state`.
  - Import `queryKeys` from `@/app/_types/keys`.
  - Import `FeedGetResponseBody` from `@/app/api/feed/route`.
  - Import `buildQueryParams` from `@/utils/api-helpers`.
  - Import `tryCatchFetch` from `@/utils/try-catch`.
  - Create `useFeed(authUserId: string)` hook:
    - **Note**: `authUserId` is required (not nullable) since feed requires authentication.
    - Get `queryClient` using `useQueryClient()`.
    - Use `useSuspenseInfiniteQuery` with:
      - Query key: `queryKeys.feed(authUserId)`.
      - Query function: `fetchFeedPage` that accepts `{ pageParam }` (page number) and fetches from `/api/feed`.
      - `getNextPageParam`: `(lastPage: FeedGetResponseBody, allPages) => lastPage.hasNextPage ? allPages.length + 1 : undefined`.
        - Uses page number as `pageParam` (1, 2, 3, etc.).
        - Returns `undefined` when `hasNextPage` is `false` (no more pages).
      - `initialPageParam`: `1` (first page is page 1).
      - `staleTime: 60 * 1000` (60 seconds) for fast back/forward navigation.
      - In `queryFn`, after fetching each page, call `setTilesSaveStateCache(queryClient, page.tiles, authUserId)` (following pattern from `useSupplierTiles`).
    - Flatten pages into single tiles array: `data.pages.flatMap(page => page.tiles)`.
    - Extract `hasNextPage` from last page: `data.pages[data.pages.length - 1]?.hasNextPage ?? false`.
    - Return: `{ tiles, fetchNextPage, hasNextPage, isFetchingNextPage }`.
  - Create `fetchFeedPage` helper function that:
    - Accepts `{ pageParam }: { pageParam: number }` (page number from React Query, starting at 1).
    - Builds query params using `buildQueryParams` with `pageSize` (default 20).
      - **Note**: No cursor needed - view tracking handles pagination automatically. Each request gets the next batch of unviewed tiles.
    - Fetches from `/api/feed` using `tryCatchFetch`.
    - Returns `FeedGetResponseBody`.

### 2. Create useInfiniteScroll Hook
- Create `src/app/_hooks/use-infinite-scroll.ts`:
  - Create `useInfiniteScroll({ onIntersect, disabled })` hook:
    - Accepts `onIntersect: () => void` callback and optional `disabled?: boolean` flag.
    - Uses `useRef` to create `sentinelRef` for DOM element attachment.
    - Uses `useEffect` to set up `IntersectionObserver`:
      - Observes `sentinelRef.current` when it exists.
      - Calls `onIntersect` when sentinel enters viewport (threshold: 0.1 or similar).
      - Skips observation if `disabled` is true.
      - Cleans up observer on unmount or when dependencies change.
    - Returns `{ sentinelRef }` for attachment to DOM element.
  - Handle edge cases: observer cleanup, disabled state, ref changes.

### 3. Create FeedClient Component
- Create `src/app/feed/feed-client.tsx`:
  - Mark as client component with `'use client'`.
  - Import `useFeed` from `@/app/_hooks/use-feed`.
  - Import `useInfiniteScroll` from `@/app/_hooks/use-infinite-scroll`.
  - Import `TileList`, `TileListSkeleton`, `noTiles` from `@/components/tiles/tile-list`.
  - Import `useAuthUser` from `@/app/_hooks/use-auth-user`.
  - Create `FeedClient` component:
    - Get auth user from `useAuthUser()` hook: `const { data: authUser } = useAuthUser()`.
    - Extract `authUserId`: `const authUserId = authUser?.id`.
    - **Handle auth requirement**: If `!authUserId`, render error message or redirect (feed requires authentication).
    - Use `useFeed(authUserId!)` to get `{ tiles, fetchNextPage, hasNextPage, isFetchingNextPage }`.
      - **Note**: Use non-null assertion since we've already checked `authUserId` exists.
    - Use `useInfiniteScroll`:
      - `onIntersect`: call `fetchNextPage()` when `hasNextPage` is true and not currently fetching.
      - `disabled`: set to `!hasNextPage || isFetchingNextPage`.
    - Handle empty state: if `tiles.length === 0`, render `noTiles({ message: 'No tiles available', cta: { text: 'Explore suppliers', redirect: '/find-suppliers', show: true } })`.
    - Render `TileList` with all tiles (flattened from pages).
    - Render sentinel element after tile list: `<div ref={sentinelRef} />` for intersection observer.
    - Show `TileListSkeleton` when `isFetchingNextPage` (inline loading state for subsequent pages).

### 4. Update Feed Page with Prefetching and Suspense
- Update `src/app/feed/page.tsx`:
  - Import `Suspense` from `react`.
  - Import `dehydrate`, `HydrationBoundary`, `QueryClient` from `@tanstack/react-query`.
  - Import `queryKeys` from `@/app/_types/keys`.
  - Import `getAuthUserId` from `@/utils/auth`.
  - Import `redirect` from `next/navigation` (for auth redirect).
  - Import `FeedClient` from `./feed-client`.
  - Import `TileListSkeleton` from `@/components/tiles/tile-list`.
  - Import `Section` from `@/components/ui/section`.
  - Import `FeedGetResponseBody` from `@/app/api/feed/route`.
  - Import `buildQueryParams` from `@/utils/api-helpers`.
  - Import `tryCatchFetch` from `@/utils/try-catch`.
  - Update server component:
    - Resolve `authUserId` via `await getAuthUserId()` (returns `string | null`).
    - **Handle auth requirement**: If `!authUserId`, redirect to login page (feed requires authentication).
    - Create `queryClient` using `new QueryClient()` (following pattern from `Header` component).
    - Prefetch first page using `queryClient.fetchInfiniteQuery`:
      - Query key: `queryKeys.feed(authUserId!)`.
      - Query function: fetch from `/api/feed` with `pageSize` (default 20), using `buildQueryParams` and `tryCatchFetch`.
        - **Note**: No cursor needed - view tracking handles pagination. Each request gets next batch of unviewed tiles.
      - Configure `getNextPageParam`: `(lastPage: FeedGetResponseBody, allPages) => lastPage.hasNextPage ? allPages.length + 1 : undefined`.
        - Uses page number as `pageParam` (1, 2, 3, etc.).
      - Configure `initialPageParam`: `1` (first page is page 1).
    - Wrap `FeedClient` in `<Suspense>` with `TileListSkeleton` fallback.
    - Wrap `Suspense` in `<HydrationBoundary state={dehydrate(queryClient)}>` to inject prefetched data.
    - Wrap everything in `<Section>` component.



### 5. Manual QA & Integration Testing
- Manually test the feed page:
  - Verify initial page load shows prefetched tiles (no loading spinner).
  - Verify infinite scroll: scroll to bottom, next page loads automatically.
  - Verify no duplicates across pages (view tracking prevents duplicates).
  - **Test with authenticated user**: verify `isSaved` state works correctly (saved tiles are filtered out from feed).
  - **Test auth requirement**: verify unauthenticated users are redirected to login (feed requires authentication).
  - Verify loading skeleton shows for subsequent pages (`isFetchingNextPage`).
  - Verify empty state displays when no tiles available.
  - Test back/forward navigation: verify cache works (no refetch on back).
  - Verify sentinel element triggers at correct scroll position.
  - **Test view tracking**: verify tiles don't reappear after being viewed (wait 7 days or check database).
  - Verify `hasNextPage` logic: when fewer tiles than `pageSize` are returned, `hasNextPage` should be `false`.

