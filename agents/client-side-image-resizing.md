# Client-Side Image Resizing Feature

## Overview

Add client-side image resizing during tile upload. Resize images to multiple widths (300px, 600px, 1200px) before upload. Store all sizes in storage. Add imageSrcSet field to tiles table.
- New dependency: `react-image-file-resizer` (`pnpm i react-image-file-resizer`).

## Current Architecture Review

### Layer Responsibilities

| Layer / Component | Responsibilities / What it owns |
| --- | --- |
| `page.tsx` | Mounts upload experience, composes `UploadProvider`, renders `UploadLayout`. |
| `upload-context.tsx` | Holds UploadItems, adds or removes files, manages object URLs, exposes context API. |
| `upload-dropzone.tsx` | Renders drag-and-drop UI, validates dropped files, forwards processed files to `addFiles`. |
| `upload-layout.tsx` | Shows dropzone when empty, shows preview list when files exist, registers beforeunload guard. |
| `upload-preview.tsx` (list) | Reads files from context, maps each item to `UploadPreviewItem`, controls grid layout. |
| `upload-preview.tsx` (item) | Renders thumbnail plus per-image form, wires delete action, runs upload mutation per file. |
| `upload-preview-form.tsx` | Owns two-step React Hook Form instance, gathers Tile details, routes submit/delete/back actions. |
| `use-tile-create.ts` | Encapsulates tile creation and UploadThing call, tracks progress per uploadId, removes files on success. |
| `api/uploadthing/core.ts` | Defines upload route config, validates auth and credits, creates tile records after upload. |
| `tile-operations.ts` | Persists tiles and credits, returns tileId for client navigation. |

### Current Flow

1. User drops files in dropzone
2. Dropzone validates and calls addFiles
3. Context creates UploadItems with object URLs
4. Preview list renders each file with form
5. User fills form and submits
6. startUpload sends file to UploadThing
7. UploadThing middleware validates
8. File uploads to storage
9. onUploadComplete creates tile with imagePath
10. Client removes file from context

## Feature Requirements

### Phase 1: Single Size Resizing
- Resize images to 600px width when dropped
- Convert to JPG format
- Upload resized file to storage
- Keep existing single imagePath field

### Phase 2: Multiple Sizes
- Generate three sizes: 300px, 600px, 1200px width
- Upload all three to storage
- Add imageSrcSet JSON field to tiles table
- Structure: `{300: url, 600: url, 1200: url}`

### Optional: Background Processing
- Process images in background after drop
- Show processing indicator on preview
- Prevent form submission until ready
- Handle processing errors

#### Background Processing UX flow
1. Dropzone calls `addFiles` with the original File objects plus `processingStatus: 'processing'`.
2. `UploadProvider` kicks off async resizing and updates the matching UploadItem as each size finishes.
3. `UploadPreviewItem` reads `processingStatus`. While status is not `ready`, it shows a small spinner under the image and disables the Upload button.
4. Once the context marks the item as `ready`, `useTileCreate` may start and receives the prepared File references.
5. If resizing fails, the item flips to `error`, shows a retry link, and the form stays blocked until the user retries or deletes the tile.

## Integration Plan

### UploadItem Type Changes

Current:
```
UploadItem {
  uploadId: string
  file: File
  fileObjectUrl: string
}
```

Phase 1:
```
UploadItem {
  uploadId: string
  file: File (original)
  processedFile: File | null (resized 600px)
  fileObjectUrl: string
}
```

Phase 2:
```
UploadItem {
  uploadId: string
  file: File (original)
  processedFiles: {
    300: File | null
    600: File | null
    1200: File | null
  }
  fileObjectUrl: string
  processingStatus: 'idle' | 'processing' | 'ready' | 'error'
}
```

### UploadDropzone Changes

**Phase 1:**
- After validation, resize files before calling addFiles
- Use react-image-file-resizer to resize to 600px width, JPG
- Pass resized files to addFiles so downstream layers always receive ready files
- Show loading state during resize if needed

**Phase 2:**
- Resize to all three sizes
- Pass array of resized files or object with sizes
- Update addFiles signature

**Background Processing:**
- Call addFiles immediately with original files
- Set processingStatus to 'processing'
- Start resize in background
- Update UploadItem when ready

### UploadContext Changes

**Phase 1:**
- Update UploadItem type
- Store processedFile in state (already resized before addFiles)
- No additional processing status needed because dropzone only adds ready files

**Phase 2:**
- Store processedFiles object
- Track processing for each size
- Expose ready state (all sizes complete)

**Background Processing:**
- Add resize function to context
- Use useEffect or callback to trigger resize
- Update item state when processing completes
- Handle errors and update status

### UploadPreviewItem Changes

**Phase 1:**
- Use processedFile for upload if available
- Fall back to original file
- Show processing indicator if needed

**Phase 2:**
- Upload all three sizes
- Pass imageSrcSet structure to mutation
- Show processing for each size

**Background Processing:**
- Show processing indicator under preview
- Disable form submit button until ready
- Display error state if processing fails

### useTileCreate Changes

**Phase 1:**
- Accept single processed file
- Upload to UploadThing as before

**Phase 2:**
- Accept array of files or object with sizes
- Upload all three files
- Track progress for each upload
- Build imageSrcSet structure from responses

### UploadThing Core Changes

**Phase 1:**
- No changes needed
- Still accepts single file

**Phase 2:**
- Update maxFileCount to 3
- Accept multiple files per tile
- Map file responses to imageSrcSet structure
- Pass imageSrcSet to tileOperations.createForSupplier

### Tile Operations Changes

**Phase 1:**
- No changes needed
- Still uses single imagePath

**Phase 2:**
- Update TileCreate type to include imageSrcSet
- Store imageSrcSet in database
- Keep imagePath for backward compatibility (use 600px URL)

### Database Schema Changes

**Phase 2:**
- Add imageSrcSet column to tiles table
- Type: JSONB
- Structure: `{300: string, 600: string, 1200: string}`
- Migration required
- Use an expand-contract rollout: add the new nullable column, populate it when new uploads land, then backfill legacy rows. Only remove fallback logic after verifying all rows carry imageSrcSet.

## Implementation Considerations

### Resize Library

Use `react-image-file-resizer`:
- Resize to specific width
- Convert to JPG
- Control quality
- Returns Promise<File>

### Processing Location

**Option 1: In Dropzone (Synchronous)**
- Resize before calling addFiles
- Blocking but simple
- User waits during resize

**Option 2: In Context (Background)**
- Add files immediately
- Process in useEffect or callback
- Non-blocking but more complex
- Need state management

**Recommendation:** Start with Option 1 for Phase 1. Move to Option 2 for Phase 2 with multiple sizes.

### Error Handling

- Handle resize failures
- Show error state in preview
- Allow retry or removal
- Prevent upload if processing fails

### Performance

- Resize is CPU intensive
- Consider Web Workers for large images
- Batch processing for multiple files
- Show progress if possible

### Backward Compatibility

- Keep imagePath field
- Use 600px URL for imagePath in Phase 2
- Existing tiles work without imageSrcSet
- Frontend handles missing imageSrcSet gracefully

## File Changes Summary

### Client Components
- `upload-context.tsx`: Update UploadItem type, add processing state
- `upload-dropzone.tsx`: Add resize logic before addFiles
- `upload-preview.tsx`: Show processing state, use processed files
- `upload-preview-form.tsx`: Disable submit during processing

### Hooks
- `use-tile-create.ts`: Handle multiple file uploads, build imageSrcSet

### Server
- `core.ts`: Accept multiple files, build imageSrcSet structure
- `tile-operations.ts`: Accept imageSrcSet, store in database

### Database
- `schema.ts`: Add imageSrcSet JSONB column
- Migration: Add column, backfill if needed

### Types
- `validation-schema.ts`: Update TileCreate to include imageSrcSet
- `tiles.ts`: Update Tile type to include imageSrcSet

## Testing Considerations

- Test resize with various image sizes
- Test resize with different formats
- Test multiple file uploads
- Test processing errors
- Test form submission blocking
- Test backward compatibility
- Test database migration

## Risks & Open Questions

- UploadThing currently limits `tileUploader` to one file; confirm multi-file uploads keep the same auth and billing rules.
- Client-side resizing is CPU heavy; watch for throttling on low-power devices and consider Web Workers if perf drops.
- Background processing must surface errors fast; define how many retries happen before surfacing a hard failure.
- Storing imageSrcSet relies on client-generated URLs; confirm backend trusts these or add checksum/validation.

## Future Enhancements

- Web Workers for resize
- Progressive image loading
- Image optimization (compression)
- Thumbnail generation
- Image editing before upload

# Client-Side Image Resizing – Ticket Breakdown

## Ticket 1 · Client-Side 600px Resizing (Phase 1)
- Install `react-image-file-resizer`.
- Update `upload-dropzone.tsx` to resize dropped images to 600px JPG before pushing to context; show inline loading state during conversion.
- Update `UploadItem` in `upload-context.tsx` to include `processedFile` and ensure downstream components always read the processed file.
- Adjust `upload-preview.tsx` + `use-tile-create.ts` to use the processed file and keep UX unchanged otherwise.
- Verify UploadThing upload still succeeds with converted files; add regression tests/manual checklist.

**Acceptance:** Users drop images and immediately see previews sourced from the resized file; uploads continue to work with 600px JPGs.

## Ticket 2 · Background Processing & UX Guard (Optional)
- Introduce optional processing pipeline in `upload-context.tsx` to support asynchronous conversions (maintain original file + `processingStatus`).
- Render processing indicator + disabled Upload button in `upload-preview.tsx` / form footer until the context marks the file `ready`.
- Provide retry + error UI when conversion fails.
- Ensure beforeunload + removal flow still cleans up object URLs.

**Acceptance:** When background mode is enabled, users see per-image progress, cannot submit until conversion finishes, and can retry on failure.

## Ticket 3 · Multi-Size Generation & Upload (Phase 2)
- Update dropzone/context pipeline to create `{300, 600, 1200}` variants (async, likely reusing background processing infrastructure).
- Extend `UploadItem` to hold `processedFiles` map and surface readiness per size.
- Update `use-tile-create.ts` and UploadThing client integration to upload all sizes (max file count increases to 3) and collect returned URLs.
- Ensure UI surfaces any per-size failures and only enables Upload when all three variants are ready.

**Acceptance:** Each tile upload pushes three files to UploadThing, and the mutation returns URLs for every configured width.

## Ticket 4 · imageSrcSet Persistence (Expand–Contract)
- Migration step 1: add nullable JSONB `image_src_set` column to `tiles`.
- Update `tile-operations.ts`, types, and UploadThing server handler to accept the new structure (use 600px URL for legacy `imagePath`).
- Backfill historical rows once multi-size uploads ship, then tighten application logic to rely on `imageSrcSet` with a safe fallback.
- Document the rollout order and ensure infrastructure monitors for missing keys.

**Acceptance:** Database contains `imageSrcSet` for new uploads, legacy tiles still render via `imagePath`, and the schema change follows expand–contract best practices.

