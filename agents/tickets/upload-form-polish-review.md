# Upload Form Polish Review - Error Messages, Empty States, Loading States, A11y

## Overview
Review of the upload form, especially the credit adding functionality, for polishing error messages, empty states, loading states, and accessibility.

## Issues Found

### 1. Error Messages

#### Form Validation Errors
- ✅ **Good**: Form fields use `FormMessage` component which displays validation errors
- ⚠️ **Issue**: Credit field validation errors may not be clear:
  - `supplierId` validation: Empty string passes validation (line 235 in upload-preview-form.tsx), but should require a valid supplier
  - No validation feedback when user tries to submit with empty supplier field (*please check this is actually the case - i don't believe it is*)
  - Service field has validation, but error message could be more specific

#### API/Network Errors

- ⚠️ **Issue**: Upload errors are generic
  - `useCreateTile` shows "Tile upload failed" but doesn't provide specific error details (*use this opportunity to create a const for tile error messages in `_types/errors.ts`. we can eventually have standardised errors for tiles, suppliers, user erroes etc.*)
  - Error boundary shows generic "Error creating tile" message

### 2. Empty States

#### Supplier Search
- ⚠️ **Issue**: Empty state message is generic
  - `CommandEmpty` shows "No suppliers found." but doesn't explain why
  - Should differentiate between:
    - No search query entered
    - Search in progress (*should show skeleton*)
    - No results found for query
    - Search error occurred


#### File Upload
- ✅ **Good**: Dropzone has clear instructions
- ⚠️ **Issue**: Could improve empty state messaging when no files selected

### 3. Loading States

#### Form Submission
- ✅ **Good**: `SubmitButton` shows "Please wait" during submission
- ⚠️ **Issue**: Upload progress could be more informative
  - Shows progress bar but status text is just the status enum value (line 68 in upload-preview.tsx)
  - Status values like "creating", "uploading" should be user-friendly



### 4. Accessibility (A11y)

#### Keyboard Navigation
- ✅ **Good**: Form fields are keyboard accessible
- ⚠️ **Issue**: "Add Credit" button focus management
  - After adding credit, focus should move to new supplier search field
  - Currently focus stays on "Add Credit" button

#### Screen Reader Support
- ⚠️ **Issue**: Remove credit button has aria-label but could be more descriptive
  - Current: `aria-label="Remove credit"`
  - Better: `aria-label="Remove credit for {supplier handle}"`
- ⚠️ **Issue**: Form step indicator not announced
  - Step counter (1/2) should be in a live region or aria-label
- ⚠️ **Issue**: Supplier search popover not announced
  - When popover opens, should announce to screen readers
  - Selected supplier not clearly announced

#### ARIA Labels and Roles
- ⚠️ **Issue**: Disabled input for tile creator needs better labeling
  - Current: Just shows `@supplier.handle` in disabled input
  - Should have `aria-label` explaining it's the tile creator
- ⚠️ **Issue**: Form sections not properly labeled
  - Step 1 and Step 2 should be in `<fieldset>` with `<legend>`
- ⚠️ **Issue**: Credit field array needs better grouping
  - Each credit should be in a fieldset

#### Focus Management
- ⚠️ **Issue**: After removing credit, focus is lost
  - Should move focus to "Add Credit" button
- ⚠️ **Issue**: Form step navigation doesn't manage focus
  - When moving between steps, focus should move to first field

#### Error Announcements
- ⚠️ **Issue**: Form validation errors not announced to screen readers
  - `FormMessage` component should use `aria-live="polite"` or `aria-live="assertive"`
  - Errors should be associated with fields using `aria-describedby`

#### Color Contrast and Visual Indicators
- ✅ **Good**: Uses semantic colors for errors
- ⚠️ **Issue**: Error states should not rely solely on color
  - Should include text indicator

### 5. User Experience Improvements

#### User effort loss
- ⚠️ **Issue**: If a user navigates away before upload, their draft tiles are lost.
  - Warn user leaving the page while form is half-filled, or while upload in progress.
  - Allow them to cancel the navigation and stay on the page so their form progress is keep.

#### Feedback
- ⚠️ **Issue**: Success feedback is minimal
  - Toast says "Tile uploaded" but could be more informative
  - Toast should have button to view newly created tile


## Commit Breakdown

### Commit 1: Standardize tile error messages
**Files:**
- `src/app/_types/errors.ts` - Add `TILE_ERROR_MESSAGE` constants
- `src/app/_hooks/use-create-tile.ts` - Use new error constants
- `src/app/suppliers/[handle]/new/upload-preview.tsx` - Update error boundary

**Changes:**
- Create `TILE_ERROR_MESSAGE` const in `_types/errors.ts`
- Replace generic "Tile upload failed" with specific error messages
- Update error boundary to use standardized messages

### Commit 2: Improve supplier search UX (loading and empty states)
**Files:**
- `src/app/_hooks/use-supplier-search.ts` - Expose loading and error states
- `src/components/tiles/supplier-search-input.tsx` - Add loading skeleton, better empty states

**Changes:**
- Expose `isLoading` and `error` from `useSupplierSearch` hook
- Show skeleton loader when search is in progress
- Differentiate empty states: no query, searching, no results, error
- Show search query in "No suppliers found" message

### Commit 3: Improve upload status messages
**Files:**
- `src/app/suppliers/[handle]/new/upload-preview.tsx` - Convert status enum to user-friendly text

**Changes:**
- Create status message mapping (e.g., "creating" → "Creating tile...", "uploading" → "Uploading image...")
- Display user-friendly status text instead of enum values

### Commit 4: Add form accessibility improvements (part 1 - structure)
**Files:**
- `src/app/suppliers/[handle]/new/upload-preview-form.tsx` - Add fieldsets, legends, aria-labels

**Changes:**
- Wrap Step 1 and Step 2 in `<fieldset>` with `<legend>`
- Wrap each credit in fieldset
- Add aria-label to tile creator input explaining it's disabled
- Add aria-label to form step indicator

### Commit 5: Add form accessibility improvements (part 2 - announcements)
**Files:**
- `src/components/ui/form.tsx` - Add aria-live to FormMessage
- `src/app/suppliers/[handle]/new/upload-preview-form.tsx` - Ensure aria-describedby on fields
- `src/components/tiles/supplier-search-input.tsx` - Announce popover and selected supplier

**Changes:**
- Add `aria-live="polite"` to FormMessage component
- Ensure all form fields have `aria-describedby` pointing to error messages
- Announce when supplier search popover opens/closes
- Announce selected supplier to screen readers

### Commit 6: Improve focus management
**Files:**
- `src/app/suppliers/[handle]/new/upload-preview-form.tsx` - Add focus management

**Changes:**
- Move focus to new supplier search field after adding credit
- Move focus to "Add Credit" button after removing credit
- Move focus to first field when navigating between form steps

### Commit 7: Enhance remove credit button accessibility
**Files:**
- `src/app/suppliers/[handle]/new/upload-preview-form.tsx` - Update remove button aria-label

**Changes:**
- Include supplier handle in remove button aria-label: "Remove credit for @{handle}"

### Commit 8: Add navigation warning for unsaved form data
**Files:**
- `src/app/suppliers/[handle]/new/upload-preview-form.tsx` - Add beforeunload handler
- `src/app/suppliers/[handle]/new/upload-context.tsx` - Track form state

**Changes:**
- Warn user before leaving page if form has data or upload in progress
- Use `beforeunload` event to prevent accidental navigation

### Commit 9: Enhance success toast with view tile button
**Files:**
- `src/app/_hooks/use-create-tile.ts` - Return tile ID on success
- `src/app/suppliers/[handle]/new/upload-preview.tsx` - Pass tile ID to toast

**Changes:**
- Return tile ID from upload completion
- Add button to success toast to view newly created tile
- Link to `/t/[tileId]` page

### Commit 10: Verify and fix supplierId validation (if needed)
**Files:**
- `src/app/_types/validation-schema.ts` - Verify/update creditSchema
- `src/app/suppliers/[handle]/new/upload-preview-form.tsx` - Test validation

**Changes:**
- Verify if empty `supplierId` string actually passes validation
- If it does, add `.min(1)` to `supplierId` validation
- Test validation feedback on form submission

## Action Items (Reference)

### Priority 1: Error Messages & Standardization
1. **Verify supplierId validation** - Check if empty string actually passes validation or if Zod catches it
2. **Create tile error message constants** - Add `TILE_ERROR_MESSAGE` const in `_types/errors.ts` for standardized tile error messages
3. **Update useCreateTile** - Use new error constants and provide specific error details
4. **Update error boundary** - Use standardized error messages

### Priority 2: Empty States & Loading
5. **Supplier search empty states** - Differentiate between:
   - No search query (don't show empty state)
   - Search in progress (show skeleton loader)
   - No results found (show "No suppliers found for '{query}'")
   - Search error (show error message)
6. **Upload status messages** - Convert enum values ("creating", "uploading") to user-friendly text

### Priority 3: Accessibility (A11y)
7. **Focus management - Add Credit** - Move focus to new supplier search field after adding credit
8. **Focus management - Remove Credit** - Move focus to "Add Credit" button after removing credit
9. **Focus management - Form steps** - Move focus to first field when navigating between steps
10. **Remove button aria-label** - Include supplier handle in aria-label: "Remove credit for @{handle}"
11. **Form step indicator** - Add aria-label or live region for step counter
12. **Supplier search popover** - Announce when popover opens/closes to screen readers
13. **Selected supplier announcement** - Clearly announce selected supplier to screen readers
14. **Tile creator input** - Add aria-label explaining it's the tile creator (disabled field)
15. **Form sections** - Wrap Step 1 and Step 2 in `<fieldset>` with `<legend>`
16. **Credit field grouping** - Wrap each credit in fieldset or use aria-labelledby
17. **FormMessage aria-live** - Add `aria-live="polite"` to FormMessage component
18. **Field error association** - Ensure errors are associated with fields using `aria-describedby`

### Priority 4: User Experience
19. **Navigation warning** - Warn user before leaving page if form has data or upload in progress
20. **Success toast enhancement** - Add button to view newly created tile in success toast

## Code Locations to Review

### Files to Update
1. `src/app/suppliers/[handle]/new/upload-preview-form.tsx` - Main form component
2. `src/app/suppliers/[handle]/new/upload-preview.tsx` - Upload status display
3. `src/components/tiles/supplier-search-input.tsx` - Supplier search component
4. `src/app/_hooks/use-supplier-search.ts` - Supplier search hook
5. `src/app/_hooks/use-create-tile.ts` - Upload hook
6. `src/app/_types/errors.ts` - Add tile error constants
7. `src/components/form/field.tsx` - FormMessage component
8. `src/components/ui/form.tsx` - FormMessage component

### Components to Enhance
1. `FormMessage` - Add aria-live support
2. `SupplierSearchInput` - Add loading state (skeleton), error display, better empty states
3. `UploadPreviewForm` - Add focus management, fieldset/legend, aria-labels
4. `CreditFieldArray` - Improve accessibility, focus management, aria-labels
