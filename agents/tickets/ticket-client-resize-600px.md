# Ticket: Client-side 600px Resize Before Upload

## Goal
Resize images to 600px wide JPGs in the dropzone before they enter the upload pipeline so every downstream layer works with pre-processed files. Source of truth: `agents/client-side-image-resizing.md` (Phase 1).

## Commit Steps

### 1. Install Dependency & Wire Types
- Add `react-image-file-resizer` via `pnpm add react-image-file-resizer`.
- Document the new dependency (package.json + lockfile) if needed.
- Extend the `UploadItem` type in `upload-context.tsx` to include `processedFile: File`.
- Ensure existing items keep working by defaulting `processedFile` to the incoming file during migrations/refactors.

### 2. Implement Dropzone Resizing
- In `upload-dropzone.tsx`, after file validation, resize each accepted image to 600px width & JPG format using `react-image-file-resizer`.
- Show a lightweight loading affordance (button spinner or text) while conversion happens so users understand the pause.
- Call `addFiles` with the resized `File` instances; make sure filenames remain unique (append width suffix if needed).
- Handle and surface conversion errors with a toast.

### 3. Propagate Processed Files Through Context & Preview
- Update `UploadProvider` so `addFiles` stores both the original `File` (if needed) and `processedFile`, ensuring object URLs continue to point at the resized data.
- Audit `UploadPreviewList`/`UploadPreviewItem` to ensure previews (img `src`) use the resized object URL.
- Update `useTileCreate` (and any other upload callers) to pass `processedFile` to `startUpload`, keeping the rest of the mutation logic untouched.

### 4. Regression Pass
- Manually test the flow: drop multiple large images, confirm previews render quickly and uploads complete with the expected size cap.
- Verify UploadThing still enforces existing size limits post-resize.
- Capture before/after file sizes for one sample image to confirm the resize occurs.


