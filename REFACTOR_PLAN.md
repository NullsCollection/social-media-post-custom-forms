# Refactor Plan — page.tsx

## Goals
- Break 920-line monolith into focused, single-responsibility files
- Add dedicated Video URL field for video mode
- Keep all existing behavior intact

---

## New File Structure

```
app/
  page.tsx                        (~100 lines — state wiring + handleSubmit only)
  components/
    ImageDropZone.tsx              thumbnail grid + both drop zones
    CaptionField.tsx               mode selector + URL input + caption textarea
    PlatformPicker.tsx             platform pills
    CaptionReviewModal.tsx         AI caption review modal
    SuccessModal.tsx               success modal
    Toast.tsx                      toast notification
    FooterLinks.tsx                footer social icons
  hooks/
    usePolling.ts                  startPolling / stopPolling
    useImageUpload.ts              file state, drag/drop, reorder, remove
  lib/
    constants.ts                   MODES, PLATFORMS, MAX_CAPTION, types
```

---

## State Changes

Add a separate `videoUrl` state in `page.tsx` alongside `caption`:

```ts
const [caption, setCaption] = useState("");
const [videoUrl, setVideoUrl] = useState("");
```

Clear `videoUrl` on form reset (after successful submit).  
Pass `videoUrl` in the FormData as `video_url` so n8n receives it as a distinct field.

---

## Component Breakdown

### `lib/constants.ts`
- `Mode` type, `SocialPlatform` type
- `MODES` array
- `PLATFORMS` array (with icons)
- `MAX_CAPTION` constant

### `hooks/useImageUpload.ts`
Encapsulates:
- `imageFiles`, `previews` state
- `addFiles`, `removeImage`, `moveImage`, `moveImageUp`, `moveImageDown`
- `handleDrop`, `handleDragOver`, `handleDragLeave`, `dragging` state
- `fileInputRef`

Returns everything `ImageDropZone` and `page.tsx` need.

### `hooks/usePolling.ts`
Encapsulates:
- `pollingRef`, `executionIdRef`, `previewsRef`
- `startPolling`, `stopPolling`
- Calls `onComplete` / `onCaptionReady` callbacks passed in by `page.tsx`

### `components/ImageDropZone.tsx`
Props: `mode`, `previews`, `imageFiles`, `dragging`, `fileInputRef`, `onDrop`, `onDragOver`, `onDragLeave`, `onFileChange`, `onRemove`, `onMoveUp`, `onMoveDown`

- Disabled + grayed out when `mode === "video"`
- Renders thumbnail grid, full drop zone, compact drop zone, hidden file input

### `components/CaptionField.tsx`
Props: `mode`, `caption`, `videoUrl`, `onCaptionChange`, `onVideoUrlChange`

**Renders per mode:**
| Element | Manual | AI | Video |
|---------|--------|----|-------|
| Mode selector tabs | ✓ | ✓ | ✓ |
| URL input (`<input type="url">`) | ✗ | ✗ | ✓ |
| Caption textarea | ✓ | ✓ (disabled) | ✓ |
| Char counter | ✓ | ✗ | ✗ |

Video URL input is a single-line `<input type="url">` with placeholder `https://your-video-url.com`, shown only when `mode === "video"`. Caption textarea remains below it, always visible.

### `components/PlatformPicker.tsx`
Props: `selected`, `onChange`

Renders platform pills, toggle logic, validation message.

### `components/CaptionReviewModal.tsx`
Props: `modal`, `onApprove`, `onSubmitEdit`

Manages its own local `editMode` / `editText` state (no need to lift these to page).

### `components/SuccessModal.tsx`
Props: `open`, `onClose`

### `components/Toast.tsx`
Props: `message`

### `components/FooterLinks.tsx`
No props — static links only.

---

## FormData Changes in `/api/submit`

Add `video_url` field, accepted for `mode === "video"`:

```ts
// server validation for video mode
if (mode === "video" && !videoUrl?.trim()) {
  return 400 "Video URL is required"
}

forwardData.append("video_url", videoUrl || "");
```

---

## canSubmit Logic (updated)

```ts
const canSubmit =
  (mode === "video"
    ? videoUrl.trim().length > 0        // URL required
    : mode === "manual"
    ? caption.trim().length > 0         // caption required
    : imageFiles.length > 0) &&         // AI: images required
  selectedPlatforms.length > 0 &&
  !loading;
```

---

## What page.tsx Keeps

- All `useState` declarations
- `usePolling` and `useImageUpload` hook calls
- `handleSubmit` (FormData building + fetch)
- `canSubmit` derived value
- Layout shell (main, background glow, card, footer)
- Component composition only — no inline JSX logic

---

## Implementation Order

1. `lib/constants.ts`
2. `hooks/useImageUpload.ts`
3. `hooks/usePolling.ts`
4. `components/Toast.tsx`
5. `components/SuccessModal.tsx`
6. `components/CaptionReviewModal.tsx`
7. `components/FooterLinks.tsx`
8. `components/PlatformPicker.tsx`
9. `components/ImageDropZone.tsx`
10. `components/CaptionField.tsx` ← includes new video URL input
11. `page.tsx` cleanup + `videoUrl` state + updated FormData
12. `app/api/submit/route.ts` ← add `video_url` field + validation
