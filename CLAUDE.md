# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Wedding Moment: guests scan a QR code at a wedding, take a live photo (optional custom frame overlay) plus a short voice message, and submit anonymously (name only, no account). The couple ("pengantin") logs in to a dashboard to review submissions and bulk-download them. An admin role can create pengantin accounts and events on their behalf. Full product spec: `initial-brief.md`.

## Commands

```bash
pnpm dev              # vite dev server on :3000 (Cloudflare Workers runtime via @cloudflare/vite-plugin)
pnpm build             # production build
pnpm preview           # preview the production build
pnpm test              # vitest run (all tests, jsdom environment)
pnpm test -- <pattern>  # run a subset, e.g. `pnpm test -- purge`
pnpm generate-routes    # regenerate src/routeTree.gen.ts (normally automatic via the tanstackStart vite plugin)
pnpm deploy             # build + wrangler deploy
tsc --noEmit            # typecheck (strict mode, noUnusedLocals/Parameters on)
```

R2 bucket needs a CORS policy applied once per bucket (see `cors.json` and README's "R2 bucket CORS" section) or presigned-URL uploads from the browser fail with a CORS error — this is separate from R2 credential/auth issues (403s), which are a different failure mode.

## Architecture

**Stack**: TanStack Start (React 19, file-based routing under `src/routes`) deployed as a Cloudflare Worker, Neon serverless Postgres via Drizzle ORM, Cloudflare R2 for media (frames, guest photos, guest audio), Better Auth for pengantin/admin login.

### Server/client boundary (the thing most likely to bite you)

TanStack Start statically analyzes the client-bundled route tree and errors at build time if server-only code is reachable from it. Two eager side effects make this sharp:

- `src/server/db/client.ts` calls `neon(process.env.DATABASE_URL!)` at module scope.
- `src/server/auth/auth.ts` builds the Better Auth instance (`drizzleAdapter(db, ...)`) at module scope.

If either import stays reachable from a route file that has both `beforeLoad` and a `component` (any `_authed/*` route), that code runs in the browser bundle and crashes hydration (`process.env.DATABASE_URL` is undefined client-side).

The fix pattern, used throughout `src/server/auth/guards.ts`: wrap server-only logic in `createServerOnlyFn` (from `@tanstack/react-start`), which strips the function body and its imports from client builds. Route `beforeLoad`s call a `createServerFn`-wrapped RPC version of the guard (e.g. `getSessionOrRedirectFn`), not the raw `createServerOnlyFn` directly — `beforeLoad` also runs client-side on navigation/preload (`defaultPreload: 'intent'` in `router.tsx`), and a `createServerOnlyFn` throws immediately if invoked in the browser. Follow this pattern for any new server-only helper that must be called from a route's `beforeLoad`.

Run `pnpm build` after touching anything in `src/server/**` or route files that import from it — this class of bug only surfaces at build time, not `pnpm dev`.

### Auth & authorization

Better Auth (`src/server/auth/auth.ts`), email/password, with a custom required `role` field (`'admin' | 'pengantin'`, default `'pengantin'`) stored via the Drizzle adapter. Guards live in `src/server/auth/guards.ts`:

- `getSessionOrRedirect` — any authenticated user
- `requireAdmin` — admin only
- `requirePengantin` — pengantin or admin
- `requireEventOwner(eventId)` — pengantin who owns the event, or any admin

Each guard accepts an optional `headers` param (defaults to the ambient request's headers) purely so tests can inject a synthetic `Headers`/session cookie — vitest has no live Start request context, so `getRequestHeaders()` would throw otherwise.

Guests never authenticate. Their write paths (`createSubmission`, the `submission-photo`/`submission-audio` presign kinds in `src/routes/api/uploads.presign.ts`) instead gate on the target event's existence and `status === 'active'`.

### Media flow (R2)

Uploads and downloads go directly between the browser and R2 via presigned URLs (`src/server/storage/presign.ts`) — file bytes never transit the Worker. `POST /api/uploads/presign` (`src/routes/api/uploads.presign.ts`) is the single presign endpoint, dispatching on a `kind` discriminator (`frame` / `submission-photo` / `submission-audio`) with different authorization per kind — see the file's own comments before changing it.

Object keys follow a fixed convention in `src/server/storage/keys.ts`: `events/{eventId}/frames/{frameId}.png`, `events/{eventId}/submissions/{submissionId}/photo.jpg`, `.../audio.{ext}`. Everything for one event lives under `events/{eventId}/`, which is what makes prefix-based bulk operations (ZIP download, purge) possible.

`@aws-sdk/client-s3` does **not** work under the Workers `workerd` runtime (crashes on a Node-only version-check helper) — R2 access uses `aws4fetch`'s `AwsClient` instead (`src/server/storage/r2-client.ts`). `listR2ObjectsByPrefix` hand-parses the S3 ListObjectsV2 XML response with a regex rather than pulling in an XML parser — safe only because every key is our own convention, never derived from unescaped user input.

Bulk ZIP download (`src/routes/api/download.{$eventId}[.]zip.ts`) streams objects from R2 straight into a ZIP writer (`client-zip`) without buffering whole objects in memory.

### Retention / purge

Events carry a `retentionDeadline`; `src/server/functions/purge.ts` deletes an event's R2 objects (by prefix) and DB rows idempotently. `POST /api/cron/purge` (`src/routes/api/cron.purge.ts`) is header-secret gated (`x-cron-secret` must match `CRON_SECRET`). **This is not wired to a native Cloudflare `scheduled` handler** — `wrangler.jsonc`'s `triggers.crons` declares intent only; the installed `@tanstack/react-start` server-entry only exports `fetch`, so an external scheduler (e.g. a GitHub Actions cron workflow) must actually call the endpoint. See the comment block in `wrangler.jsonc` before assuming the cron fires on its own.

### Data model

`src/server/db/schema/`: `events` (owned by a pengantin via `ownerId`, has `slug`, `status`, `retentionDeadline`), `frames` (per-event custom photo frames), `submissions` (guest name + photo/audio object keys, per event), `auth-schema` (Better Auth's tables, includes the custom `role` field). Migrations are Drizzle-generated under `drizzle/migrations/`; config in `drizzle.config.ts`.

### Routes layout

- `src/routes/e/$eventSlug/*` — public guest flow (landing → capture → thank-you), SSR'd, no auth.
- `src/routes/_authed/*` — pengantin/admin dashboard, gated by the `_authed` layout route's `beforeLoad`.
- `src/routes/_authed/admin/*` — admin-only (managing pengantin accounts, printing QR codes on their behalf).
- `src/routes/api/*` — server-only endpoints (auth catch-all, cron purge, ZIP download, QR PNG generation, upload presign). File names like `download.{$eventId}[.]zip.ts` use TanStack Router's escaped file-naming convention to produce literal `.zip`/`.png` URL suffixes.

### Testing

Vitest + jsdom (`vitest.config.ts`), with `tests/setup-canvas.ts` polyfilling `HTMLCanvasElement` (frame-overlay compositing tests use `canvas`/`pngjs`/`jsqr` for pixel-level and QR-decoding assertions). Tests generally exercise guards/server functions directly rather than through HTTP, passing synthetic `Headers` where a session is needed (see the auth guards section above).
