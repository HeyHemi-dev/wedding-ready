# Function Parameter Patterns

This document establishes consistent patterns for function arguments across the codebase to improve readability, maintainability, and predictability.

## Core Principles

### 1. Domain Objects vs. Context Parameters
Separate business/domain objects from context/control parameters to maintain clear boundaries and avoid mixing concerns.

### 2. Parameter Ordering Convention
Order parameters by importance and frequency of change:
1. **Primary identifiers** (IDs, handles)
2. **Domain objects** (form data, entities) 
3. **Context parameters** (auth, options)
4. **Optional parameters** last

### 3. Explicit Over Implicit
Prefer explicit parameter names over passing everything in objects to make function signatures self-documenting.

## Patterns

### ✅ Individual Parameters

Use for simple, unrelated parameters:

```typescript
// Single identifier with optional context
async function getById(id: string, authUserId?: string): Promise<Tile>

// Simple lookup with context
async function search(query: string): Promise<SupplierSearchResult[]>

// Clear parameter separation
async function createCreditForTile(
  tileId: string,
  creditData: TileCreditForm,
  authUserId: string
): Promise<TileCredit[]>
```

### ✅ Domain Object Parameters

Use when parameters form a logical business unit:

```typescript
// Complete form data as single object
async function updateProfile(
  profileData: UserUpdateForm,
  authUserId: string
): Promise<User>

// Related business entity creation
async function register(
  supplierData: SupplierRegistrationForm
): Promise<Supplier>

// Domain object with additional context
async function createForSupplier(
  tileData: TileCreate
): Promise<{ id: string }>
```

### ✅ Options Objects

Use for multiple optional parameters:

```typescript
type GetTilesOptions = {
  limit?: number
  offset?: number
  sortBy?: string
}

async function getTiles(
  userId: string,
  options: GetTilesOptions = {}
): Promise<TileListItem[]>
```

## Naming Conventions

### Domain Data Objects
- Use descriptive names ending with purpose: `Form`, `Data`, `Create`
- Examples: `UserUpdateForm`, `TileCreate`, `SupplierRegistrationForm`

### Context Parameters
- Use clear identifiers: `authUserId`, `userId`, `supplierId`
- Include type context: `handle`, `email`, `tileId`

### Options Objects
- End with `Options` suffix
- Example: `GetTilesOptions`, `SearchOptions`



## Function Categories

### Operation Functions
Operations (in `/operations/` directory) generally follow this pattern:

```typescript
// ✅ Standard operation pattern
async function operationName(
  primaryId: string,          // or domain object first
  domainData?: SomeForm,      // if needed
  authUserId?: string         // auth context
): Promise<ReturnType>
```

### Model Functions  
Model functions (in `/models/` directory) generally follow this pattern:

```typescript
// ✅ Simple model pattern
async function getById(id: string): Promise<Entity | null>
async function create(data: InsertEntityRaw): Promise<Entity>
async function update(id: string, data: SetEntityRaw): Promise<Entity>
```

### Form Actions
Form actions should consistently accept form data, and submittedBy:

```typescript
// ✅ Standard form action pattern
export async function updateProfileFormAction(
  userId: string,             // user to update
  data: UserUpdateForm,       // data to insert
  submittedBy: string,        // authUserId from frontend
): Promise<UserUpdateForm> {
  const authUserId = await getAuthUserId()
  // ... implementation
}
```

## Examples from Codebase

### Good Examples

```typescript
// Clear separation of concerns
async function updateProfile(
  id: string
  { displayName, bio, avatarUrl }: UserUpdateForm,
  submittedBy: string
): Promise<User>

// Simple ID lookup with optional context
async function getById(id: string, authUserId?: string): Promise<Tile>

// Domain object for complex creation
async function register(supplierData: SupplierRegistrationForm): Promise<Supplier>
```


