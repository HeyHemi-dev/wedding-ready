[ReadMe](/README.md)

# Wedding Ready Feed Fetch Architecture

This document focuses on how the personalized tile feed is fetched, filtered, and cached for logged-in users.

## 1) System Context (high-level)

```mermaid
flowchart LR
  User["Authenticated user"] --> FeedPage["/feed page"]
  FeedPage --> FeedClient["FeedClient + useFeed hook"]
  FeedClient --> FeedApi["GET /api/feed?pageSize=n"]
  FeedApi --> FeedOps["tileOperations.getFeedForUser"]
  FeedOps --> FeedModel["tileModel.getFeed"]
  FeedModel --> DB[("Postgres: tiles, viewed_tiles, saved_tiles")]
  FeedApi --> FeedClient
  FeedClient --> Cache["React Query cache\nsetTilesSaveStateCache"]
  Cache --> TileCards["Tile cards + save buttons"]
```

## 2) Detailed Request/Query Flow

```mermaid
sequenceDiagram
  participant U as Authenticated User
  participant FC as FeedClient/useFeed
  participant API as GET /api/feed
  participant OPS as tileOperations.getFeedForUser
  participant MODEL as tileModel.getFeed
  participant DB as Postgres
  participant QC as React Query Cache

  U->>FC: Open /feed
  FC->>API: fetch /api/feed?pageSize=FEED_PAGE_SIZE
  API->>API: parseQueryParams + validate pageSize
  API->>API: getAuthUserId()
  alt unauthenticated
    API-->>FC: 401 Unauthorized
  else authenticated
    API->>OPS: getFeedForUser(authUserId, pageSize)
    OPS->>OPS: MAX_PAGE_SIZE = min(pageSize, 100)
    OPS->>MODEL: getFeed(authUserId, {limit: MAX_PAGE_SIZE})

    MODEL->>DB: SELECT tiles LEFT JOIN viewed_tiles, saved_tiles
    Note over MODEL,DB: Filter out private tiles, recently viewed tiles (7d), and saved tiles
    MODEL->>DB: ORDER BY score DESC LIMIT limit
    MODEL->>DB: UPSERT viewed_tiles for returned tile ids
    DB-->>MODEL: tile rows

    MODEL-->>OPS: tilesRaw
    OPS->>OPS: Map to TileListItem with isSaved=false
    OPS->>OPS: hasNextPage = tilesRaw.length === MAX_PAGE_SIZE
    OPS-->>API: { tiles, hasNextPage }
    API-->>FC: JSON response

    FC->>QC: setTilesSaveStateCache(page.tiles, authUserId)
    QC-->>FC: tile save-state queries pre-hydrated
    FC-->>U: Render list + infinite scroll sentinel
  end
```

## 3) Why Save State Is Set During Feed Fetch

- `getFeedForUser` sets `isSaved: false` for each feed tile because the SQL query already excludes saved tiles for that user.
- `useFeed` then calls `setTilesSaveStateCache(...)` to pre-populate per-tile save-state query entries, preventing extra per-tile requests when save buttons render.
- Result: fewer network round trips and consistent save-button state across components.

## 4) Query/Ranking Behavior Worth Noting

- Feed candidates are sorted by `tiles.score` descending.
- The feed query excludes:
  - private tiles,
  - tiles viewed by the user in the last 7 days,
  - tiles already saved by the user.
- Returned tiles are immediately marked viewed (upsert) within the same DB transaction to avoid instant repeats.

## 5) Key Files

- `src/app/feed/feed-client.tsx`
- `src/app/_hooks/use-feed.ts`
- `src/app/api/feed/route.ts`
- `src/operations/tile-operations.ts`
- `src/models/tile.ts`
- `src/utils/usequery-helpers.ts`
