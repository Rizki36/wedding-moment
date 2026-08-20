# Eternal Muse design system rollout

## Context

`DESIGN.md` was updated to document a new design system, "Eternal Muse," derived from a Stitch prototype (Modern Romance / Minimalist-Elegant aesthetic for high-end weddings). It replaces the app's current minimal cream/dark-green palette (Fraunces + Inter, pill-shaped buttons/inputs) with a Material Design 3-style token set (Ivory/Champagne/Forest Green/Blush Pink, Playfair Display + Montserrat, 8px/16px rounded shapes). This spec covers rolling that system out across the whole app: theme tokens, shared UI primitives, the dashboard shell, dashboard pages, and the public guest-facing flow.

Decisions locked in during brainstorming:
- **Scope**: whole app at once (marketing, guest capture flow, dashboard, admin), not a partial rollout.
- **Token set**: implement the full ~40-value M3-style palette from `DESIGN.md`'s frontmatter (not the simplified 4-color prose summary).
- **Shape system**: adopt the new shape language fully — buttons/inputs become `rounded-md` (8px), cards `rounded-lg` (16px), pill/`rounded-full` reserved for avatars, status chips/tags. This replaces the current pill-shaped buttons and inputs everywhere, including the guest capture flow.

## Non-goals

- No new pages, routes, or features — this is a visual/token-level restyle of existing surfaces only.
- No changes to component logic, data flow, or server code.
- No dark mode — the palette stays fixed light, per existing convention (`DESIGN.md` doesn't specify a dark variant).
- `DESIGN.md` itself is not modified further by this work; it's already updated and is the source of truth being implemented.

## Phase 1 — Theme foundation + shared UI primitives

**Files**: `src/styles.css`, `src/components/ui/Button.tsx`, `src/components/ui/Badge.tsx`, new `src/components/ui/Card.tsx`, new `src/components/ui/Chip.tsx`.

- Replace the `@theme` block in `styles.css`: swap the Google Fonts `@import` from Fraunces/Inter to Playfair Display (weights 500/600/700) + Montserrat (weights 400/500/600), and replace the 4 existing color variables with the full Eternal Muse token set from `DESIGN.md`'s frontmatter (`--color-surface`, `--color-primary`, `--color-secondary`, `--color-tertiary`, `--color-error`, all their `on-*`/`*-container`/`*-fixed` pairs, `--color-outline`, `--color-outline-variant`, etc.), plus a radius scale (`--radius-sm: 0.25rem`, `--radius: 0.5rem`, `--radius-md: 0.75rem`, `--radius-lg: 1rem`, `--radius-xl: 1.5rem`) and `--font-display`/`--font-sans` reassigned to Playfair Display/Montserrat.
- `Button`/`LinkButton`: `primary` variant becomes solid `bg-(--color-primary)` / `text-(--color-on-primary)`, `rounded-md`, with a `hover:border-(--color-primary-container)` 1px border per DESIGN.md. `outline`/secondary variant becomes solid Ivory (`bg-(--color-surface-container-lowest)`) with a soft ambient shadow instead of a border, or an outlined Forest Green variant — pick one consistently based on what the button primitives already distinguish (primary CTA vs. secondary action).
- `Badge`: recolor onto the new palette (tertiary/blush for accent use, per DESIGN.md's "used sparingly for highlights").
- New `Card` primitive: Ivory background (`bg-(--color-surface-container-lowest)`), no border, soft ambient shadow (`shadow-[0_4px_20px_rgba(45,71,57,0.04)]` per DESIGN.md's "Blur 20px, Opacity 4%, Color Forest Green" spec), `rounded-lg`, generous padding. This becomes the base for `SubmissionCard`, `QrCodeCard`, and other card-shaped dashboard elements.
- New `Chip` primitive: pill-shaped, Blush Pink or Champagne background, `label-md` typography (14px, weight 600, uppercase-ish letter-spacing), for RSVP/status/tag use.
- Verify: `pnpm build` + `tsc --noEmit` pass (font/token references compile); a quick visual check of the marketing page (`src/routes/index.tsx`, unchanged in this phase) to confirm nothing broke since it already consumes these tokens.

## Phase 2 — Dashboard shell (Sidebar, Navbar, DashboardShell)

**Files**: `src/components/layout/Sidebar.tsx`, `src/components/layout/Navbar.tsx`, `src/components/layout/DashboardShell.tsx`.

- Swap flat borders/colors for surface-container tokens (`surface-container-low`/`surface-container` for panel backgrounds) and the new ambient shadow instead of hard borders, matching DESIGN.md's "Ambient Shadows and Tonal Layering" elevation approach.
- Active nav link state uses `primary`/`primary-container` background instead of whatever the current active-state styling is.
- Keep the existing responsive drawer behavior (mobile/desktop breakpoints) — this phase only changes color/shape/elevation, not layout structure or breakpoints.
- Verify: visual check on mobile (390px) and desktop (1440px) viewports via `pnpm dev` + browser, confirming active-link highlighting and drawer still work exactly as before restyle (this reuses the verification already done when the shell shipped — commit 5498a70).

## Phase 3 — Dashboard pages and components

**Files**: `src/components/dashboard/SubmissionCard.tsx`, `SubmissionGrid.tsx`, `QrCodeCard.tsx`, `FrameUploadForm.tsx`, `BulkDownloadButton.tsx`, and the dashboard route files under `src/routes/_authed/dashboard/**` and `src/routes/_authed/admin/**`.

- `SubmissionCard` and `QrCodeCard` move onto the new `Card` primitive (Phase 1) instead of their current hand-rolled `border ... rounded-2xl` styling.
- Form inputs across `FrameUploadForm` and any dashboard forms switch from pill (`rounded-full`) to the DESIGN.md input style: bottom-border-only or light Champagne background, `rounded-md`, Forest Green focus border.
- Buttons (`BulkDownloadButton`, form submits) use the updated `Button` primitive from Phase 1 — no new button styling introduced here.
- Verify: exercise the dashboard in-browser (event list, submissions grid, QR card, frame upload, bulk download button state) to confirm nothing regressed functionally, plus `pnpm build`/`tsc --noEmit`.

## Phase 4 — Guest-facing flow and marketing

**Files**: `src/routes/index.tsx`, `src/routes/login.tsx`, `src/routes/register.tsx`, `src/components/capture/*.tsx`, `src/routes/e/$eventSlug/*.tsx`.

- Marketing page: heading typography moves to Playfair Display (already the case via `--font-display`, but weight/tracking adjusts per DESIGN.md's `display-lg`/`headline-lg` scale), `Badge`/`LinkButton` pick up Phase 1's restyle automatically.
- Capture flow (`GuestNameForm`, `CameraCapture`, `FramePicker`, `AudioRecorder`, `CapturePreview`): pill inputs (`rounded-full border ... bg-(--color-bg)`) become the new bottom-border/`rounded-md` input style; buttons pick up Phase 1 automatically. All existing Indonesian copy is preserved verbatim — this phase touches classes only, never text content.
- `login.tsx`/`register.tsx`: same input restyle as the capture flow.
- Verify: full guest flow walkthrough in-browser (landing → capture → thank-you) on mobile viewport, since this is the guest-facing, mobile-first surface most sensitive to regressions; confirm login/register still authenticate correctly (functional, not just visual, regression check) since these are the highest-risk forms to break with a class-only restyle.

## Cross-cutting

- **`DESIGN.md` update**: after all phases land, update `DESIGN.md`'s own "Tokens/Components/Patterns by surface" reference sections (the parts below the frontmatter, which still describe the *old* Fraunces/pill-button system as of this spec) to describe the new system as implemented — mirroring what the original `DESIGN.md` (pre-this-update) did for the old system. This keeps `DESIGN.md` accurate as living documentation rather than half old/half new.
- **No new dependencies**: Playfair Display and Montserrat load via the existing Google Fonts `@import` pattern already used for Fraunces/Inter — no new font-loading mechanism.
- **Order matters**: phases build on each other (primitives before consumers), so implement and verify in order 1 → 2 → 3 → 4 rather than in parallel.
