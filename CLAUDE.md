# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Commands

```bash
npm run dev      # Start dev server at localhost:3000
npm run build    # Production build
npm run lint     # ESLint check
```

No test suite is configured.

## Environment

Copy `.env.example` to `.env.local` and fill in:
- `WEBHOOK_URL` — n8n webhook endpoint that receives form submissions
- `BASIC_AUTH_USER` / `BASIC_AUTH_PASS` — Basic Auth credentials for the webhook
- `N8N_HOST` — n8n host (used by `proxy.ts`)

## Architecture

Single-page Next.js 16 app (App Router) with multiple API routes. Stack: React 19, Tailwind CSS v4, TypeScript.

### Data flow — form submission

1. `app/page.tsx` — thin orchestrator. Uses `useImageUpload` and `usePolling` hooks; renders extracted components. On submit, POSTs `FormData` to `/api/submit` with images, caption, videoUrl, mode (`manual`|`ai`|`video`), and selected platforms.
2. `app/api/submit/route.ts` — validates images, forwards everything to `WEBHOOK_URL` (n8n webhook) via Basic Auth. Adds metadata: `filenames`, `image_count`, `submitted_at`.

### Data flow — caption review loop (AI mode)

3. n8n POSTs generated caption to `app/api/caption-review/route.ts` with `{ executionId, resumeUrl, caption, fileName }`. Stored in in-memory Map with 10-min TTL.
4. `app/page.tsx` polls `app/api/caption-status/route.ts` every 2s. Returns `{ pending }`, `{ completed }`, or `{ caption, executionId }`.
5. On caption ready → `CaptionReviewModal` shown. User approves or requests edit.
6. Approval POSTs to `app/api/resume/route.ts` with `{ executionId, approval }`. Route looks up `resumeUrl` from store and calls n8n with `{ data: { approval } }` — the `data` wrapper is required by n8n's Wait node.
7. n8n finishes → POSTs `{ executionId, status }` to `app/api/post-complete/route.ts` → stored in completionStore → next poll tick triggers success modal.

### Components & hooks

- `app/hooks/useImageUpload.ts` — image state, drag-drop, preview URLs, reorder, reset
- `app/hooks/usePolling.ts` — polling loop with `onComplete`, `onCaptionReady`, `onError` callbacks
- `app/lib/constants.tsx` — `MAX_CAPTION`, `MODES`, `PLATFORMS`, `Mode`, `SocialPlatform` types
- `app/lib/store.ts` — in-memory `captionStore` and `completionStore` (global Maps, 10-min TTL). Not safe for multi-instance deployments.
- `app/components/` — `ImageDropZone`, `CaptionField`, `PlatformPicker`, `CaptionReviewModal`, `SuccessModal`, `Toast`, `FooterLinks`

### Key details

- Brand color `#FF6B35` (orange); dark navy `#1a2035` for submit button.
- Caption hard-limited to `MAX_CAPTION = 1000` characters.
- Video mode disables the image drop zone and requires a `videoUrl` instead; `videoUrl` is forwarded to n8n.
- AI mode disables the caption textarea — caption generated downstream by n8n.
- n8n resumes via `resumeUrl` stored server-side; browser never sees it directly.
- `proxy.ts` at root is a standalone dev script, not imported by Next.js.
- `app/layout.tsx` — root layout with DM Sans font and dark body background (`#0c0c0c`).
