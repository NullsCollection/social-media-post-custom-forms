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
- `app/hooks/usePolling.ts` — polling loop with `onComplete`, `onCaptionReady`, `onError` callbacks; stops after 15 consecutive failures
- `app/hooks/useFocusTrap.ts` — focus trap for modals; auto-focuses first element, restores focus on close
- `app/lib/constants.tsx` — `MAX_CAPTION`, `MODES`, `PLATFORMS`, `Mode`, `SocialPlatform` types
- `app/lib/store.ts` — in-memory `captionStore` and `completionStore` (global Maps). TTL uses absolute `expiresAt` timestamp checked on every read — serverless-safe. Not safe for multi-instance deployments.
- `app/lib/auth.ts` — `verifyBasicAuth()` using `crypto.timingSafeEqual` — used by inbound n8n routes only
- `app/components/` — `ImageDropZone`, `CaptionField`, `PlatformPicker`, `CaptionReviewModal`, `SuccessModal`, `Toast`, `FooterLinks`

### API route auth model

- **n8n → app** (`/api/caption-review`, `/api/post-complete`): protected by `verifyBasicAuth` — n8n sends `BASIC_AUTH_USER`/`BASIC_AUTH_PASS` via Basic Auth header.
- **browser → app** (`/api/submit`, `/api/caption-status`, `/api/resume`): no Basic Auth — protected by UUID entropy (`executionId`) and the fact that `resumeUrl` is never sent to the browser.
- **app → n8n** (`WEBHOOK_URL`, `resumeUrl`): app sends Basic Auth credentials outbound. n8n resume payload must be `{ data: { approval } }` — the `data` wrapper is required by n8n's Wait node.

### Validation rules (server-side)

- `mode` must be one of `manual | ai | video` — rejected with 400 otherwise.
- `platforms[]` filtered to `facebook | instagram | twitter | linkedin` — unknown values stripped.
- `videoUrl` must parse as a valid URL with `http:` or `https:` scheme, max 2048 chars.
- Images required for non-video modes; `videoUrl` required for video mode.
- Webhook error body is logged server-side only — never forwarded to the browser.

### Key details

- Brand color `#FF6B35` (orange); dark navy `#1a2035` for submit button.
- Caption hard-limited to `MAX_CAPTION = 1000` characters (client-side only).
- Video mode disables the image drop zone and requires a `videoUrl`; switching modes clears stale state (images cleared entering video, `videoUrl` cleared leaving video).
- AI mode disables the caption textarea — caption generated downstream by n8n.
- `resumeUrl` is stored server-side only and never returned to the browser.
- Modals (`CaptionReviewModal`, `SuccessModal`) have focus traps, `role="dialog"`, `aria-modal`, and `aria-labelledby`.
- `Toast` uses `role="alert"` and `aria-live="assertive"` for screen reader announcements.
- `proxy.ts` at root is a standalone dev script, not imported by Next.js.
- `app/layout.tsx` — root layout with DM Sans font and dark body background (`#0c0c0c`).
