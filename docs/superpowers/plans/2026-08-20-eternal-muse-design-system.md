# Eternal Muse Design System Rollout Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the app's current cream/dark-green minimal theme with the "Eternal Muse" design system (Ivory/Champagne/Forest Green/Blush Pink palette, Playfair Display + Montserrat typography, 8px/16px rounded shapes) across every surface: theme tokens, shared UI primitives, the dashboard shell, dashboard pages, and the public guest-facing flow.

**Architecture:** This is a token- and className-level restyle, not a logic change. Phase 1 establishes CSS variables in `src/styles.css` and two shared primitives (`Button`/`LinkButton`, `Badge`, plus a new `Card`). Later phases update consumers (layout shell, dashboard components/pages, guest flow) to reference the new tokens and, where applicable, the new `Card` primitive. No component's props, behavior, or data flow changes — only the strings inside `className`.

**Tech Stack:** Tailwind CSS v4 (`@theme` CSS-variable theming, arbitrary-value syntax `bg-(--color-x)`), React 19, TanStack Start/Router.

**Spec:** `docs/superpowers/specs/2026-08-20-eternal-muse-design-system-design.md`

## Global Constraints

- Full ~40-value M3-style color palette from `DESIGN.md`'s frontmatter, not the simplified 4-color prose summary.
- Shape system fully adopted: buttons/inputs `rounded` (Tailwind DEFAULT, mapped to 8px), cards `rounded-lg` (mapped to 16px), `rounded-full` reserved for avatars/status pills. **Note on a `DESIGN.md` inconsistency**: its "Shapes" prose calls the 8px radius `rounded-md`, but its own frontmatter `rounded` scale has `DEFAULT: 0.5rem` (8px) and `md: 0.75rem` (12px) — those don't match. This plan follows the frontmatter's numeric values via Tailwind's own class names (`rounded` = 8px, `rounded-lg` = 16px), not the prose's mismatched label, so the implemented radii are correct even though the label differs from the prose.
- Colors and fonts are referenced via the existing arbitrary-value convention (`bg-(--color-x)`, `font-(--font-x)`), never literal Tailwind palette classes or inline hex — this matches the current codebase convention documented in `DESIGN.md`.
- No dark mode — palette stays fixed light.
- Guest-facing copy stays in Indonesian, verbatim — every task below changes `className` strings only, never text content.
- **Deviation from spec**: the spec's Phase 1 calls for a `Chip` primitive alongside `Card`. No current screen has an RSVP/status/tag use case for it (YAGNI) — this plan builds `Card` only. If a future feature needs chips, add `Chip` then.
- **Test strategy for this plan**: these are presentational-only changes (no new logic, no new branches), so there are no new unit tests to write. Each task's "test cycle" is `tsc --noEmit` (catches broken imports/props) plus, for Phase 1 and the final task, `pnpm build` (catches the client/server bundling class of bug called out in `CLAUDE.md`) and an in-browser visual check. Do not invent fake unit tests for className strings.

---

## Phase 1 — Theme foundation + shared UI primitives

### Task 1: Theme tokens and fonts

**Files:**
- Modify: `src/styles.css`

**Interfaces:**
- Produces: CSS custom properties consumed by every later task — `--color-surface`, `--color-surface-container-lowest`, `--color-surface-container-low`, `--color-surface-container`, `--color-on-surface`, `--color-on-surface-variant`, `--color-outline`, `--color-outline-variant`, `--color-primary`, `--color-on-primary`, `--color-primary-container`, `--color-on-primary-container`, `--color-secondary`, `--color-on-secondary`, `--color-secondary-container`, `--color-on-secondary-container`, `--color-tertiary`, `--color-on-tertiary`, `--color-tertiary-container`, `--color-on-tertiary-container`, `--color-inverse-surface`, `--color-inverse-on-surface`; `--font-display` (Playfair Display), `--font-sans` (Montserrat); Tailwind radius overrides `--radius-sm`, `--radius`, `--radius-md`, `--radius-lg`, `--radius-xl` (so `rounded`/`rounded-lg`/etc. classes pick up the new scale automatically, no arbitrary-value syntax needed for radius).

- [ ] **Step 1: Replace `src/styles.css`**

```css
@import "tailwindcss";
@import url("https://fonts.googleapis.com/css2?family=Playfair+Display:wght@500;600;700&family=Montserrat:wght@400;500;600&display=swap");

@theme {
  --color-surface: #fafaeb;
  --color-surface-dim: #dbdbcd;
  --color-surface-bright: #fafaeb;
  --color-surface-container-lowest: #ffffff;
  --color-surface-container-low: #f4f5e6;
  --color-surface-container: #efefe0;
  --color-surface-container-high: #e9e9db;
  --color-surface-container-highest: #e3e3d5;
  --color-on-surface: #1b1c14;
  --color-on-surface-variant: #4c463f;
  --color-inverse-surface: #2f3128;
  --color-inverse-on-surface: #f1f2e3;
  --color-outline: #7e766e;
  --color-outline-variant: #cfc5bc;
  --color-surface-tint: #665d53;
  --color-primary: #665d53;
  --color-on-primary: #ffffff;
  --color-primary-container: #f3e5d8;
  --color-on-primary-container: #70665b;
  --color-inverse-primary: #d1c4b8;
  --color-secondary: #496455;
  --color-on-secondary: #ffffff;
  --color-secondary-container: #ccead6;
  --color-on-secondary-container: #4f6a5b;
  --color-tertiary: #70585b;
  --color-on-tertiary: #ffffff;
  --color-tertiary-container: #ffe0e3;
  --color-on-tertiary-container: #7a6164;
  --color-error: #ba1a1a;
  --color-on-error: #ffffff;
  --color-error-container: #ffdad6;
  --color-on-error-container: #93000a;
  --color-primary-fixed: #eee0d3;
  --color-primary-fixed-dim: #d1c4b8;
  --color-on-primary-fixed: #211a13;
  --color-on-primary-fixed-variant: #4e453c;
  --color-secondary-fixed: #ccead6;
  --color-secondary-fixed-dim: #b0cdbb;
  --color-on-secondary-fixed: #062014;
  --color-on-secondary-fixed-variant: #324c3e;
  --color-tertiary-fixed: #fbdbde;
  --color-tertiary-fixed-dim: #debfc2;
  --color-on-tertiary-fixed: #281719;
  --color-on-tertiary-fixed-variant: #574144;
  --color-background: #fafaeb;
  --color-on-background: #1b1c14;
  --color-surface-variant: #e3e3d5;

  --font-display: "Playfair Display", serif;
  --font-sans: "Montserrat", sans-serif;

  --radius-sm: 0.25rem;
  --radius: 0.5rem;
  --radius-md: 0.75rem;
  --radius-lg: 1rem;
  --radius-xl: 1.5rem;
}

* {
  box-sizing: border-box;
}

body {
  margin: 0;
  font-family: var(--font-sans);
  background-color: var(--color-surface);
  color: var(--color-on-surface);
}

main {
  width: min(42rem, calc(100% - 2rem));
  margin: 4rem auto;
}
```

- [ ] **Step 2: Verify the app still builds with the old token names still in use elsewhere**

Run: `tsc --noEmit`
Expected: passes (this is a CSS-only file; TypeScript won't catch stale `--color-fg`/`--color-bg` references in `className` strings — those still work today because they're just undefined CSS vars, which Tailwind's arbitrary-value syntax emits harmlessly. They'll be replaced consumer-by-consumer in later tasks.)

Run: `pnpm build`
Expected: succeeds (this task changes no imports or server/client boundaries, so this mainly re-confirms the existing build is healthy before the token rename ripples out)

- [ ] **Step 3: Commit**

```bash
git add src/styles.css
git commit -m "feat: Replace theme tokens with Eternal Muse palette and fonts"
```

### Task 2: Button and LinkButton primitive

**Files:**
- Modify: `src/components/ui/Button.tsx`

**Interfaces:**
- Consumes: `--color-primary`, `--color-on-primary`, `--color-primary-container` (Task 1)
- Produces: unchanged public API (`Button`, `LinkButton`, `ButtonVariant = 'primary' | 'outline'`) — every consumer across later tasks keeps calling these exactly as before.

- [ ] **Step 1: Replace `src/components/ui/Button.tsx`**

```tsx
import { Link, type LinkProps } from '@tanstack/react-router'
import type { ButtonHTMLAttributes, ReactNode } from 'react'

export type ButtonVariant = 'primary' | 'outline'

const base = 'inline-flex items-center justify-center gap-2 rounded px-6 py-3 font-medium text-center transition disabled:opacity-50 disabled:cursor-not-allowed'

function variantClasses(variant: ButtonVariant) {
  return variant === 'primary'
    ? `${base} bg-(--color-primary) text-(--color-on-primary) border border-transparent hover:border-(--color-primary-container)`
    : `${base} border border-(--color-primary) text-(--color-primary) hover:bg-(--color-primary-container)/40`
}

type ButtonProps = {
  variant?: ButtonVariant
  children: ReactNode
} & ButtonHTMLAttributes<HTMLButtonElement>

/** Plain `<button>` primitive — use for form submits and in-page actions. */
export function Button({ variant = 'primary', children, className = '', ...rest }: ButtonProps) {
  return (
    <button className={`${variantClasses(variant)} ${className}`} {...rest}>
      {children}
    </button>
  )
}

type LinkButtonProps = {
  variant?: ButtonVariant
  children: ReactNode
  className?: string
} & LinkProps

/** `@tanstack/react-router` `Link`-based primitive — use for navigation. */
export function LinkButton({ variant = 'primary', children, className = '', ...rest }: LinkButtonProps) {
  return (
    <Link className={`${variantClasses(variant)} ${className}`} {...rest}>
      {children}
    </Link>
  )
}
```

- [ ] **Step 2: Verify**

Run: `tsc --noEmit`
Expected: passes — no prop/type changes.

- [ ] **Step 3: Commit**

```bash
git add src/components/ui/Button.tsx
git commit -m "feat: Restyle Button/LinkButton primitive onto Eternal Muse tokens"
```

### Task 3: Badge and Card primitives

**Files:**
- Modify: `src/components/ui/Badge.tsx`
- Create: `src/components/ui/Card.tsx`

**Interfaces:**
- Consumes: `--color-tertiary-container`, `--color-on-tertiary-container`, `--color-surface-container-lowest` (Task 1)
- Produces: `Badge({ children, className? })` (unchanged signature), new `Card({ children, className? })` — a bare surface with no built-in padding (callers supply their own `p-*` via `className` so padding never conflicts with the primitive's own classes).

- [ ] **Step 1: Replace `src/components/ui/Badge.tsx`**

```tsx
import type { ReactNode } from 'react'

/** Small circular accent badge (e.g. the heart-icon dot in the visual reference). */
export function Badge({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <span
      className={`inline-flex items-center justify-center w-10 h-10 rounded-full bg-(--color-tertiary-container) text-(--color-on-tertiary-container) text-sm ${className}`}
    >
      {children}
    </span>
  )
}
```

- [ ] **Step 2: Create `src/components/ui/Card.tsx`**

```tsx
import type { ReactNode } from 'react'

/**
 * Base card surface: Ivory background, no border, soft ambient shadow, 16px
 * radius. Deliberately has no built-in padding — callers add their own `p-*`
 * via `className` so it never fights with a consumer's own spacing classes.
 */
export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={`bg-(--color-surface-container-lowest) rounded-lg shadow-[0_4px_20px_rgba(45,71,57,0.04)] ${className}`}
    >
      {children}
    </div>
  )
}
```

- [ ] **Step 3: Verify**

Run: `tsc --noEmit`
Expected: passes.

- [ ] **Step 4: Commit**

```bash
git add src/components/ui/Badge.tsx src/components/ui/Card.tsx
git commit -m "feat: Recolor Badge and add Card primitive for Eternal Muse system"
```

---

## Phase 2 — Dashboard shell

### Task 4: Sidebar

**Files:**
- Modify: `src/components/layout/Sidebar.tsx`

**Interfaces:**
- Consumes: `--color-inverse-surface`, `--color-surface-container-lowest`, `--color-outline-variant`, `--color-on-surface`, `--color-primary-container`, `--color-on-primary-container`, `--color-on-surface-variant`, `--color-surface-container` (Task 1)
- Produces: unchanged props (`SidebarProps`).

- [ ] **Step 1: Replace `src/components/layout/Sidebar.tsx`**

```tsx
import { Link, useLocation } from '@tanstack/react-router'

type SidebarProps = {
  role: 'admin' | 'pengantin'
  open: boolean
  onNavigate: () => void
}

const dashboardLinks = [{ to: '/dashboard', label: 'Acara Saya' } as const]
const adminLinks = [{ to: '/admin', label: 'Akun Pengantin' } as const]

export function Sidebar({ role, open, onNavigate }: SidebarProps) {
  const pathname = useLocation({ select: (l) => l.pathname })
  const isAdminSection = pathname.startsWith('/admin')
  const links = isAdminSection ? adminLinks : dashboardLinks

  return (
    <>
      {open && (
        <button
          aria-label="Tutup menu"
          onClick={onNavigate}
          className="fixed inset-0 z-20 bg-(--color-inverse-surface)/40 md:hidden"
        />
      )}
      <aside
        className={`fixed inset-y-0 left-0 z-30 flex w-64 flex-col bg-(--color-surface-container-lowest) p-6 shadow-[0_4px_20px_rgba(45,71,57,0.06)] transition-transform md:sticky md:top-0 md:h-screen md:translate-x-0 md:shadow-none md:border-r md:border-(--color-outline-variant) ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <Link to="/" className="font-(--font-display) text-xl text-(--color-on-surface)">
          Wedding Moment
        </Link>

        <nav className="mt-8 flex flex-col gap-1">
          {links.map((link) => {
            const active = pathname === link.to || pathname.startsWith(`${link.to}/`)
            return (
              <Link
                key={link.to}
                to={link.to}
                onClick={onNavigate}
                className={`rounded px-4 py-2 text-sm font-medium transition ${
                  active
                    ? 'bg-(--color-primary-container) text-(--color-on-primary-container)'
                    : 'text-(--color-on-surface-variant) hover:bg-(--color-surface-container)'
                }`}
              >
                {link.label}
              </Link>
            )
          })}
          {role === 'admin' && !isAdminSection && (
            <Link
              to="/admin"
              onClick={onNavigate}
              className="mt-4 rounded px-4 py-2 text-sm font-medium text-(--color-on-surface-variant) hover:bg-(--color-surface-container)"
            >
              Buka Panel Admin
            </Link>
          )}
          {role === 'admin' && isAdminSection && (
            <Link
              to="/dashboard"
              onClick={onNavigate}
              className="mt-4 rounded px-4 py-2 text-sm font-medium text-(--color-on-surface-variant) hover:bg-(--color-surface-container)"
            >
              Kembali ke Dashboard
            </Link>
          )}
        </nav>
      </aside>
    </>
  )
}
```

- [ ] **Step 2: Verify**

Run: `tsc --noEmit`
Expected: passes.

- [ ] **Step 3: Commit**

```bash
git add src/components/layout/Sidebar.tsx
git commit -m "feat: Restyle Sidebar onto Eternal Muse tokens"
```

### Task 5: Navbar

**Files:**
- Modify: `src/components/layout/Navbar.tsx`

**Interfaces:**
- Consumes: `--color-surface-container-lowest`, `--color-surface-container`, `--color-on-surface`, `--color-on-surface-variant`, `--color-primary`, `--color-primary-container` (Task 1); `Badge` (Task 3, unchanged signature).
- Produces: unchanged props (`NavbarProps`).

Note: `src/components/layout/DashboardShell.tsx` has no color/shape classes of its own (only structural flex/layout classes) — it needs no change in this phase. Its correctness is covered by this task's browser verification, since it renders `Sidebar` + `Navbar` together.

- [ ] **Step 1: Replace `src/components/layout/Navbar.tsx`**

```tsx
import { useNavigate } from '@tanstack/react-router'
import { signOut } from '../../server/auth/auth-client'
import { Badge } from '../ui/Badge'

type NavbarProps = {
  userName: string
  role: 'admin' | 'pengantin'
  onMenuClick: () => void
}

const roleLabel: Record<NavbarProps['role'], string> = {
  admin: 'Admin',
  pengantin: 'Pengantin',
}

export function Navbar({ userName, role, onMenuClick }: NavbarProps) {
  const navigate = useNavigate()

  async function handleLogout() {
    await signOut()
    navigate({ to: '/' })
  }

  return (
    <header className="sticky top-0 z-10 flex items-center justify-between bg-(--color-surface-container-lowest) px-4 py-3 shadow-[0_2px_12px_rgba(45,71,57,0.05)] md:px-8">
      <button
        aria-label="Buka menu"
        onClick={onMenuClick}
        className="rounded p-2 hover:bg-(--color-surface-container) md:hidden"
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M2 5h16M2 10h16M2 15h16" strokeLinecap="round" />
        </svg>
      </button>

      <div className="flex items-center gap-3 md:ml-auto">
        <div className="hidden text-right sm:block">
          <p className="text-sm font-medium text-(--color-on-surface)">{userName}</p>
          <p className="text-xs text-(--color-on-surface-variant)">{roleLabel[role]}</p>
        </div>
        <Badge>{userName.charAt(0).toUpperCase()}</Badge>
        <button
          onClick={handleLogout}
          className="rounded border border-(--color-primary) px-4 py-2 text-sm font-medium text-(--color-primary) transition hover:bg-(--color-primary-container)/40"
        >
          Keluar
        </button>
      </div>
    </header>
  )
}
```

- [ ] **Step 2: Verify**

Run: `tsc --noEmit`
Expected: passes.

Visual check: `pnpm dev`, log in as a pengantin (or register a fresh test account), confirm the dashboard shell renders with the new palette, the mobile drawer (viewport ≤ 767px) still opens/closes via the hamburger button, and the active nav link is highlighted with the Champagne container color. This exercises `DashboardShell` end-to-end even though it wasn't edited.

- [ ] **Step 3: Commit**

```bash
git add src/components/layout/Navbar.tsx
git commit -m "feat: Restyle Navbar onto Eternal Muse tokens"
```

---

## Phase 3 — Dashboard components and pages

### Task 6: SubmissionCard, SubmissionGrid, QrCodeCard

**Files:**
- Modify: `src/components/dashboard/SubmissionCard.tsx`
- Modify: `src/components/dashboard/SubmissionGrid.tsx`
- Modify: `src/components/dashboard/QrCodeCard.tsx`

**Interfaces:**
- Consumes: `Card` (Task 3); `--color-on-surface`, `--color-on-surface-variant`, `--color-primary`, `--color-on-primary` (Task 1).
- Produces: unchanged props on all three components.

- [ ] **Step 1: Replace `src/components/dashboard/SubmissionCard.tsx`**

```tsx
import { Card } from '../ui/Card'

export function SubmissionCard({
  guestName,
  photoUrl,
  audioUrl,
}: {
  guestName: string
  photoUrl: string
  audioUrl: string
}) {
  return (
    <Card className="flex flex-col gap-2 p-3">
      <img src={photoUrl} alt={guestName} className="rounded aspect-square object-cover w-full" />
      <p className="font-medium text-(--color-on-surface)">{guestName}</p>
      <audio src={audioUrl} controls className="w-full" />
    </Card>
  )
}
```

- [ ] **Step 2: Replace `src/components/dashboard/SubmissionGrid.tsx`**

```tsx
import { SubmissionCard } from './SubmissionCard'

type SubmissionWithUrls = { id: string; guestName: string; photoUrl: string; audioUrl: string }

export function SubmissionGrid({ submissions }: { submissions: SubmissionWithUrls[] }) {
  if (submissions.length === 0) {
    return <p className="text-(--color-on-surface-variant) p-8 text-center">Belum ada ucapan dari tamu.</p>
  }
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {submissions.map((s) => (
        <SubmissionCard key={s.id} guestName={s.guestName} photoUrl={s.photoUrl} audioUrl={s.audioUrl} />
      ))}
    </div>
  )
}
```

- [ ] **Step 3: Replace `src/components/dashboard/QrCodeCard.tsx`**

```tsx
import { Card } from '../ui/Card'

export function QrCodeCard({ eventId, slug }: { eventId: string; slug: string }) {
  const eventUrl = typeof window !== 'undefined' ? `${window.location.origin}/e/${slug}` : `/e/${slug}`
  return (
    <Card className="flex flex-col items-center gap-2 p-4">
      <img src={`/api/qr/${eventId}.png`} alt="QR Code Acara" className="w-48 h-48" />
      <p className="text-sm text-(--color-on-surface-variant) break-all">{eventUrl}</p>
      {/* Plain `<a>`, not `LinkButton` — points at an API-served file, not a router route. */}
      <a
        href={`/api/qr/${eventId}.png?download=1`}
        className="rounded bg-(--color-primary) text-(--color-on-primary) px-4 py-2 text-sm font-medium transition hover:opacity-90"
      >
        Unduh QR Code
      </a>
    </Card>
  )
}
```

- [ ] **Step 4: Verify**

Run: `tsc --noEmit`
Expected: passes.

- [ ] **Step 5: Commit**

```bash
git add src/components/dashboard/SubmissionCard.tsx src/components/dashboard/SubmissionGrid.tsx src/components/dashboard/QrCodeCard.tsx
git commit -m "feat: Move submission/QR dashboard cards onto Card primitive"
```

### Task 7: FrameUploadForm and BulkDownloadButton

**Files:**
- Modify: `src/components/dashboard/FrameUploadForm.tsx`
- Modify: `src/components/dashboard/BulkDownloadButton.tsx`

**Interfaces:**
- Consumes: `--color-primary`, `--color-on-primary`, `--color-primary-container` (Task 1).
- Produces: unchanged props on both.

- [ ] **Step 1: Edit `src/components/dashboard/FrameUploadForm.tsx`**

Replace the `label` className (the only visual line) — full file:

```tsx
import { useState } from 'react'
import { nanoid } from 'nanoid'
import { createFrameFn } from '../../server/functions/frames'

export function FrameUploadForm({ eventId, onUploaded }: { eventId: string; onUploaded: () => void }) {
  const [uploading, setUploading] = useState(false)

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.type !== 'image/png') {
      alert('Bingkai harus berupa PNG transparan')
      return
    }
    setUploading(true)
    try {
      const frameId = nanoid(10)
      const presignRes = await fetch('/api/uploads/presign', {
        method: 'POST',
        body: JSON.stringify({ kind: 'frame', eventId, frameId, contentType: file.type }),
      })
      if (!presignRes.ok) {
        alert('Gagal mendapatkan izin unggah.')
        return
      }
      const { url, key } = await presignRes.json()
      await fetch(url, { method: 'PUT', body: file, headers: { 'Content-Type': file.type } })
      await createFrameFn({ data: { eventId, name: file.name, objectKey: key } })
      onUploaded()
    } finally {
      setUploading(false)
    }
  }

  return (
    <label className="rounded border border-(--color-primary) text-(--color-primary) px-4 py-2 text-sm font-medium cursor-pointer inline-block transition hover:bg-(--color-primary-container)/40">
      {uploading ? 'Mengunggah...' : 'Unggah Bingkai (PNG)'}
      <input type="file" accept="image/png" onChange={handleFileChange} className="hidden" disabled={uploading} />
    </label>
  )
}
```

- [ ] **Step 2: Replace `src/components/dashboard/BulkDownloadButton.tsx`**

```tsx
// Plain `<a>`, not `LinkButton` — this points at an API-served file
// (`/api/download/*.zip`), not a TanStack Router route, so it can't use
// `Link`'s `to` prop. Styled to match the `Button` primitive by hand.
export function BulkDownloadButton({ eventId }: { eventId: string }) {
  return (
    <a
      href={`/api/download/${eventId}.zip`}
      className="rounded bg-(--color-primary) text-(--color-on-primary) px-6 py-3 inline-block font-medium transition hover:opacity-90"
    >
      Unduh Semua
    </a>
  )
}
```

- [ ] **Step 3: Verify**

Run: `tsc --noEmit`
Expected: passes.

- [ ] **Step 4: Commit**

```bash
git add src/components/dashboard/FrameUploadForm.tsx src/components/dashboard/BulkDownloadButton.tsx
git commit -m "feat: Restyle frame upload and bulk download controls"
```

### Task 8: Dashboard list pages (no forms)

**Files:**
- Modify: `src/routes/_authed/dashboard/index.tsx`
- Modify: `src/routes/_authed/dashboard/events.$eventId/index.tsx`
- Modify: `src/routes/_authed/dashboard/events.$eventId/submissions.tsx`

**Interfaces:**
- Consumes: `--color-on-surface`, `--color-on-surface-variant`, `--color-surface-container-lowest` (Task 1); `LinkButton` (Task 2, unchanged); `QrCodeCard` (Task 6, unchanged); `BulkDownloadButton` (Task 7, unchanged); `SubmissionGrid` (Task 6, unchanged).

- [ ] **Step 1: Replace `src/routes/_authed/dashboard/index.tsx`**

```tsx
import { createFileRoute, Link } from '@tanstack/react-router'
import { listMyEventsFn } from '../../../server/functions/events'
import { LinkButton } from '#/components/ui/Button'

export const Route = createFileRoute('/_authed/dashboard/')({
  loader: async () => listMyEventsFn(),
  component: DashboardHome,
})

function DashboardHome() {
  const events = Route.useLoaderData()
  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="font-(--font-display) text-3xl text-(--color-on-surface)">Acara Saya</h1>
        <LinkButton to="/dashboard/events/new">Buat Acara</LinkButton>
      </div>
      <ul className="grid gap-4">
        {events.map((event) => (
          <li key={event.id}>
            <Link
              to="/dashboard/events/$eventId"
              params={{ eventId: event.id }}
              className="block bg-(--color-surface-container-lowest) rounded-lg shadow-[0_4px_20px_rgba(45,71,57,0.04)] p-4 text-(--color-on-surface)"
            >
              {event.brideName} &amp; {event.groomName} — {event.eventDate}
            </Link>
          </li>
        ))}
      </ul>
      {events.length === 0 && <p className="text-(--color-on-surface-variant)">Belum ada acara.</p>}
    </div>
  )
}
```

- [ ] **Step 2: Replace `src/routes/_authed/dashboard/events.$eventId/index.tsx`**

```tsx
import { createFileRoute } from '@tanstack/react-router'
import { requireEventOwnerFn } from '../../../../server/auth/guards'
import { getEventFn } from '../../../../server/functions/events'
import { QrCodeCard } from '../../../../components/dashboard/QrCodeCard'
import { LinkButton } from '#/components/ui/Button'

export const Route = createFileRoute('/_authed/dashboard/events/$eventId/')({
  beforeLoad: async ({ params }) => {
    await requireEventOwnerFn({ data: params.eventId })
  },
  loader: async ({ params }) => getEventFn({ data: params.eventId }),
  component: EventOverview,
})

function EventOverview() {
  const event = Route.useLoaderData()
  return (
    <div className="p-8">
      <h1 className="font-(--font-display) text-2xl text-(--color-on-surface)">
        {event?.brideName} &amp; {event?.groomName}
      </h1>
      <p className="text-(--color-on-surface-variant)">
        {event?.eventDate} — {event?.venue}
      </p>
      <LinkButton
        to="/dashboard/events/$eventId/frames"
        params={{ eventId: event?.id ?? '' }}
        variant="outline"
        className="mt-4"
      >
        Kelola Bingkai
      </LinkButton>
      <LinkButton
        to="/dashboard/events/$eventId/submissions"
        params={{ eventId: event?.id ?? '' }}
        variant="outline"
        className="mt-4 ml-2"
      >
        Lihat Ucapan Tamu
      </LinkButton>
      {event && <QrCodeCard eventId={event.id} slug={event.slug} />}
    </div>
  )
}
```

- [ ] **Step 3: Replace `src/routes/_authed/dashboard/events.$eventId/submissions.tsx`**

```tsx
import { createFileRoute } from '@tanstack/react-router'
import { requireEventOwnerFn } from '../../../../server/auth/guards'
import { listSubmissionsForEventFn } from '../../../../server/functions/submissions'
import { SubmissionGrid } from '../../../../components/dashboard/SubmissionGrid'
import { BulkDownloadButton } from '../../../../components/dashboard/BulkDownloadButton'

export const Route = createFileRoute('/_authed/dashboard/events/$eventId/submissions')({
  beforeLoad: async ({ params }) => {
    await requireEventOwnerFn({ data: params.eventId })
  },
  loader: async ({ params }) => listSubmissionsForEventFn({ data: params.eventId }),
  component: SubmissionsPage,
})

function SubmissionsPage() {
  const submissionList = Route.useLoaderData()
  const { eventId } = Route.useParams()

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-(--font-display) text-2xl text-(--color-on-surface)">Ucapan Tamu</h1>
        <BulkDownloadButton eventId={eventId} />
      </div>
      <SubmissionGrid submissions={submissionList} />
    </div>
  )
}
```

- [ ] **Step 4: Verify**

Run: `tsc --noEmit`
Expected: passes.

- [ ] **Step 5: Commit**

```bash
git add src/routes/_authed/dashboard/index.tsx src/routes/_authed/dashboard/events.\$eventId/index.tsx src/routes/_authed/dashboard/events.\$eventId/submissions.tsx
git commit -m "feat: Restyle dashboard list and overview pages"
```

### Task 9: Dashboard forms (frames, settings, new event)

**Files:**
- Modify: `src/routes/_authed/dashboard/events.$eventId/frames.tsx`
- Modify: `src/routes/_authed/dashboard/events.$eventId/settings.tsx`
- Modify: `src/routes/_authed/dashboard/events.new.tsx`

**Interfaces:**
- Consumes: `--color-on-surface`, `--color-on-surface-variant`, `--color-outline-variant`, `--color-surface-container-low`, `--color-primary` (Task 1); `Button` (Task 2, unchanged); `FrameUploadForm` (Task 7, unchanged).
- Produces (this task): the shared input class string used by every dashboard text input from here on — `"border-b-2 border-(--color-outline-variant) bg-(--color-surface-container-low) rounded px-3 py-2 text-(--color-on-surface) focus:border-(--color-primary) focus:outline-none transition-colors"` — Task 12 (login/register) and Task 13 (capture forms) reuse this exact string.

- [ ] **Step 1: Replace `src/routes/_authed/dashboard/events.$eventId/frames.tsx`**

```tsx
import { createFileRoute, useRouter } from '@tanstack/react-router'
import { requireEventOwnerFn } from '../../../../server/auth/guards'
import { listFramesForEventFn, deleteFrameFn } from '../../../../server/functions/frames'
import { FrameUploadForm } from '../../../../components/dashboard/FrameUploadForm'

export const Route = createFileRoute('/_authed/dashboard/events/$eventId/frames')({
  beforeLoad: async ({ params }) => {
    await requireEventOwnerFn({ data: params.eventId })
  },
  loader: async ({ params }) => listFramesForEventFn({ data: params.eventId }),
  component: FramesPage,
})

function FramesPage() {
  const frameList = Route.useLoaderData()
  const { eventId } = Route.useParams()
  const router = useRouter()

  return (
    <div className="p-8">
      <h1 className="font-(--font-display) text-2xl text-(--color-on-surface) mb-4">Bingkai Foto</h1>
      <FrameUploadForm eventId={eventId} onUploaded={() => router.invalidate()} />
      <ul className="grid grid-cols-3 gap-4 mt-6">
        {frameList.map((frame) => (
          <li
            key={frame.id}
            className="bg-(--color-surface-container-lowest) rounded-lg shadow-[0_4px_20px_rgba(45,71,57,0.04)] p-2"
          >
            <p className="text-sm text-(--color-on-surface)">{frame.name}</p>
            <button
              onClick={async () => {
                await deleteFrameFn({ data: { frameId: frame.id } })
                router.invalidate()
              }}
              className="text-red-600 text-sm"
            >
              Hapus
            </button>
          </li>
        ))}
      </ul>
      {frameList.length === 0 && <p className="text-(--color-on-surface-variant)">Belum ada bingkai.</p>}
    </div>
  )
}
```

- [ ] **Step 2: Replace `src/routes/_authed/dashboard/events.$eventId/settings.tsx`**

```tsx
import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { requireEventOwnerFn } from '../../../../server/auth/guards'
import { getEventFn, updateEventFn } from '../../../../server/functions/events'
import { Button } from '#/components/ui/Button'

export const Route = createFileRoute('/_authed/dashboard/events/$eventId/settings')({
  beforeLoad: async ({ params }) => {
    await requireEventOwnerFn({ data: params.eventId })
  },
  loader: async ({ params }) => getEventFn({ data: params.eventId }),
  component: EventSettings,
})

function EventSettings() {
  const event = Route.useLoaderData()
  const [venue, setVenue] = useState(event?.venue ?? '')
  const [saved, setSaved] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!event) return
    await updateEventFn({ data: { eventId: event.id, venue } })
    setSaved(true)
  }

  return (
    <form onSubmit={handleSubmit} className="p-8 max-w-md flex flex-col gap-4">
      <h1 className="font-(--font-display) text-2xl text-(--color-on-surface)">Pengaturan Acara</h1>
      <input
        value={venue}
        onChange={(e) => setVenue(e.target.value)}
        placeholder="Lokasi"
        className="border-b-2 border-(--color-outline-variant) bg-(--color-surface-container-low) rounded px-3 py-2 text-(--color-on-surface) focus:border-(--color-primary) focus:outline-none transition-colors"
      />
      {saved && <p className="text-sm text-(--color-on-surface-variant)">Tersimpan.</p>}
      <Button type="submit">Simpan</Button>
    </form>
  )
}
```

- [ ] **Step 3: Replace `src/routes/_authed/dashboard/events.new.tsx`**

```tsx
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { createEventFn } from '../../../server/functions/events'
import { Button } from '#/components/ui/Button'

export const Route = createFileRoute('/_authed/dashboard/events/new')({ component: NewEventPage })

const inputClass =
  'border-b-2 border-(--color-outline-variant) bg-(--color-surface-container-low) rounded px-3 py-2 text-(--color-on-surface) focus:border-(--color-primary) focus:outline-none transition-colors'

function NewEventPage() {
  const navigate = useNavigate()
  const [brideName, setBrideName] = useState('')
  const [groomName, setGroomName] = useState('')
  const [eventDate, setEventDate] = useState('')
  const [venue, setVenue] = useState('')
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    try {
      const event = await createEventFn({
        data: { brideName, groomName, eventDate, venue },
      })
      navigate({ to: '/dashboard/events/$eventId', params: { eventId: event.id } })
    } catch {
      setError('Gagal membuat acara')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto mt-12 flex flex-col gap-4 p-8">
      <h1 className="font-(--font-display) text-2xl text-(--color-on-surface)">Buat Acara Baru</h1>
      <input
        value={brideName}
        onChange={(e) => setBrideName(e.target.value)}
        placeholder="Nama Pengantin Wanita"
        required
        className={inputClass}
      />
      <input
        value={groomName}
        onChange={(e) => setGroomName(e.target.value)}
        placeholder="Nama Pengantin Pria"
        required
        className={inputClass}
      />
      <input
        value={eventDate}
        onChange={(e) => setEventDate(e.target.value)}
        type="date"
        required
        className={inputClass}
      />
      <input
        value={venue}
        onChange={(e) => setVenue(e.target.value)}
        placeholder="Lokasi (opsional)"
        className={inputClass}
      />
      {error && <p className="text-red-600 text-sm">{error}</p>}
      <Button type="submit">Simpan</Button>
    </form>
  )
}
```

- [ ] **Step 4: Verify**

Run: `tsc --noEmit`
Expected: passes.

Visual check: create a test event through the form, confirm the new bottom-border input style and focus color work, then delete a frame to confirm the still-red "Hapus" action (intentionally unthemed, matches `DESIGN.md`'s error-text convention) still functions.

- [ ] **Step 5: Commit**

```bash
git add src/routes/_authed/dashboard/events.\$eventId/frames.tsx src/routes/_authed/dashboard/events.\$eventId/settings.tsx src/routes/_authed/dashboard/events.new.tsx
git commit -m "feat: Restyle dashboard forms with new input style"
```

### Task 10: Admin pages

**Files:**
- Modify: `src/routes/_authed/admin/index.tsx`
- Modify: `src/routes/_authed/admin/pengantin.new.tsx`
- Modify: `src/routes/_authed/admin/pengantin.$id.tsx`
- Modify: `src/routes/_authed/admin/events.$eventId.qr.tsx`

**Interfaces:**
- Consumes: same input class string from Task 9; `--color-on-surface`, `--color-on-surface-variant` (Task 1); `LinkButton`/`Button` (Task 2); `QrCodeCard` (Task 6).

- [ ] **Step 1: Replace `src/routes/_authed/admin/index.tsx`**

```tsx
import { createFileRoute, Link } from '@tanstack/react-router'
import { listPengantinFn } from '../../../server/functions/users'
import { LinkButton } from '#/components/ui/Button'

export const Route = createFileRoute('/_authed/admin/')({
  loader: async () => listPengantinFn(),
  component: AdminHome,
})

function AdminHome() {
  const pengantinList = Route.useLoaderData()
  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="font-(--font-display) text-3xl text-(--color-on-surface)">Akun Pengantin</h1>
        <LinkButton to="/admin/pengantin/new">Buat Akun</LinkButton>
      </div>
      <ul className="grid gap-2">
        {pengantinList.map((p) => (
          <li key={p.id}>
            <Link to="/admin/pengantin/$id" params={{ id: p.id }} className="text-(--color-on-surface)">
              {p.name} — {p.email}
            </Link>
          </li>
        ))}
      </ul>
      {pengantinList.length === 0 && <p className="text-(--color-on-surface-variant)">Belum ada akun pengantin.</p>}
    </div>
  )
}
```

- [ ] **Step 2: Replace `src/routes/_authed/admin/pengantin.new.tsx`**

```tsx
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { createPengantinAccountFn } from '../../../server/functions/users'
import { Button } from '#/components/ui/Button'

export const Route = createFileRoute('/_authed/admin/pengantin/new')({ component: NewPengantinPage })

const inputClass =
  'border-b-2 border-(--color-outline-variant) bg-(--color-surface-container-low) rounded px-3 py-2 text-(--color-on-surface) focus:border-(--color-primary) focus:outline-none transition-colors'

function NewPengantinPage() {
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    try {
      const user = await createPengantinAccountFn({ data: { name, email, password } })
      navigate({ to: '/admin/pengantin/$id', params: { id: user.id } })
    } catch {
      setError('Gagal membuat akun')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-sm mx-auto mt-12 flex flex-col gap-4">
      <h1 className="font-(--font-display) text-2xl text-(--color-on-surface)">Buat Akun Pengantin</h1>
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Nama"
        required
        className={inputClass}
      />
      <input
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        type="email"
        placeholder="Email"
        required
        className={inputClass}
      />
      <input
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        type="password"
        placeholder="Kata sandi sementara"
        required
        className={inputClass}
      />
      <p className="text-sm text-(--color-on-surface-variant)">
        Beri tahu kredensial ini secara manual kepada pengantin (chat/telepon).
      </p>
      {error && <p className="text-red-600 text-sm">{error}</p>}
      <Button type="submit">Buat Akun</Button>
    </form>
  )
}
```

- [ ] **Step 3: Replace `src/routes/_authed/admin/pengantin.$id.tsx`**

```tsx
import { createFileRoute, Link } from '@tanstack/react-router'
import { listEventsForOwnerFn } from '../../../server/functions/events'

export const Route = createFileRoute('/_authed/admin/pengantin/$id')({
  loader: async ({ params }) => listEventsForOwnerFn({ data: params.id }),
  component: PengantinDetail,
})

function PengantinDetail() {
  const events = Route.useLoaderData()
  return (
    <div className="p-8">
      <h1 className="font-(--font-display) text-2xl text-(--color-on-surface) mb-4">Acara milik pengantin ini</h1>
      <ul className="grid gap-2">
        {events.map((event) => (
          <li key={event.id}>
            <Link
              to="/dashboard/events/$eventId"
              params={{ eventId: event.id }}
              className="text-(--color-on-surface)"
            >
              {event.brideName} &amp; {event.groomName}
            </Link>
          </li>
        ))}
      </ul>
      {events.length === 0 && <p className="text-(--color-on-surface-variant)">Belum ada acara.</p>}
    </div>
  )
}
```

- [ ] **Step 4: Replace `src/routes/_authed/admin/events.$eventId.qr.tsx`**

```tsx
import { createFileRoute } from '@tanstack/react-router'
import { getEventFn } from '../../../server/functions/events'
import { QrCodeCard } from '../../../components/dashboard/QrCodeCard'

/**
 * `requireAdmin` is already enforced by the parent `/_authed/admin` layout
 * route's `beforeLoad` (see `src/routes/_authed/admin.tsx`) — matches the
 * existing `pengantin.$id.tsx` admin route, which also has no `beforeLoad`
 * of its own. `getEventFn` itself calls `requireEventOwner`, which lets
 * admins through regardless of ownership.
 */
export const Route = createFileRoute('/_authed/admin/events/$eventId/qr')({
  loader: async ({ params }) => getEventFn({ data: params.eventId }),
  component: AdminQrPage,
})

function AdminQrPage() {
  const event = Route.useLoaderData()
  if (!event) return null
  return (
    <div className="p-8">
      <h1 className="font-(--font-display) text-2xl text-(--color-on-surface) mb-4">
        Cetak QR untuk {event.brideName} &amp; {event.groomName}
      </h1>
      <QrCodeCard eventId={event.id} slug={event.slug} />
    </div>
  )
}
```

- [ ] **Step 5: Verify**

Run: `tsc --noEmit`
Expected: passes.

- [ ] **Step 6: Commit**

```bash
git add src/routes/_authed/admin/index.tsx src/routes/_authed/admin/pengantin.new.tsx src/routes/_authed/admin/pengantin.\$id.tsx src/routes/_authed/admin/events.\$eventId.qr.tsx
git commit -m "feat: Restyle admin pages onto Eternal Muse tokens"
```

---

## Phase 4 — Guest-facing flow and marketing

### Task 11: Marketing page and thank-you page

**Files:**
- Modify: `src/routes/index.tsx`
- Modify: `src/routes/e/$eventSlug/thank-you.tsx`

**Interfaces:**
- Consumes: `--color-surface`, `--color-on-surface`, `--color-on-surface-variant` (Task 1); `Badge` (Task 3); `LinkButton` (Task 2).

- [ ] **Step 1: Replace `src/routes/index.tsx`**

```tsx
import { createFileRoute } from '@tanstack/react-router'
import { LinkButton } from '#/components/ui/Button'
import { Badge } from '#/components/ui/Badge'

export const Route = createFileRoute('/')({ component: Home })

function Home() {
  return (
    <main className="bg-(--color-surface) min-h-screen">
      <div className="w-full max-w-4xl mx-auto px-6 py-16 flex flex-col items-center text-center gap-6">
        <Badge className="mb-2">♥</Badge>
        <h1 className="font-(--font-display) text-(--color-on-surface) text-4xl sm:text-6xl leading-tight tracking-tight">
          Kenangan Diabadikan
          <br />
          di Setiap Momen
        </h1>
        <p className="text-(--color-on-surface-variant) max-w-md">
          Ambil foto dan rekam ucapan untuk pengantin, langsung dari ponsel Anda — tanpa aplikasi, cukup pindai
          kode QR.
        </p>
        <div className="flex gap-4 flex-wrap justify-center mt-2">
          <LinkButton to="/login">Masuk</LinkButton>
          <LinkButton to="/register" variant="outline">
            Daftar
          </LinkButton>
        </div>
      </div>
    </main>
  )
}

export default Home
```

Note: the `uppercase` class on the heading is dropped — `DESIGN.md`'s Playfair Display headline spec (`display-lg`/`headline-lg`) doesn't call for uppercase, and Playfair Display's high-contrast serif strokes (the thing DESIGN.md says convey luxury) are far less legible in all-caps than the old Fraunces heading was.

- [ ] **Step 2: Replace `src/routes/e/$eventSlug/thank-you.tsx`**

```tsx
import { createFileRoute } from '@tanstack/react-router'
import { Badge } from '#/components/ui/Badge'

export const Route = createFileRoute('/e/$eventSlug/thank-you')({
  component: () => (
    <div className="bg-(--color-surface) min-h-screen p-8 text-center flex flex-col items-center gap-4 justify-center">
      <Badge>♥</Badge>
      <h1 className="font-(--font-display) text-3xl text-(--color-on-surface)">Terima kasih!</h1>
      <p className="text-(--color-on-surface-variant)">Ucapan Anda telah tersimpan untuk pengantin.</p>
    </div>
  ),
})
```

- [ ] **Step 3: Verify**

Run: `tsc --noEmit` then `pnpm build`
Expected: both pass — this is the first Phase 4 task, so re-confirm the client-bundling constraints in `CLAUDE.md` still hold (neither of these routes touches server-only imports, but `pnpm build` is cheap insurance before continuing).

- [ ] **Step 4: Commit**

```bash
git add src/routes/index.tsx src/routes/e/\$eventSlug/thank-you.tsx
git commit -m "feat: Restyle marketing and thank-you pages"
```

### Task 12: Login and register pages

**Files:**
- Modify: `src/routes/login.tsx`
- Modify: `src/routes/register.tsx`

**Interfaces:**
- Consumes: same input class string as Task 9; `--color-surface`, `--color-on-surface` (Task 1); `Button` (Task 2).

- [ ] **Step 1: Replace `src/routes/login.tsx`**

```tsx
import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { signIn } from '../server/auth/auth-client'
import { Button } from '#/components/ui/Button'

export const Route = createFileRoute('/login')({ component: LoginPage })

const inputClass =
  'border-b-2 border-(--color-outline-variant) bg-(--color-surface-container-low) rounded px-4 py-3 text-(--color-on-surface) focus:border-(--color-primary) focus:outline-none transition-colors'

function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    const { error } = await signIn.email({ email, password })
    if (error) setError(error.message ?? 'Login gagal')
    else window.location.href = '/dashboard'
  }

  return (
    <main className="bg-(--color-surface) min-h-screen flex items-center justify-center px-6">
      <form onSubmit={handleSubmit} className="w-full max-w-sm flex flex-col gap-4">
        <h1 className="font-(--font-display) text-3xl text-(--color-on-surface) text-center mb-2">Masuk</h1>
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          type="email"
          placeholder="Email"
          required
          className={inputClass}
        />
        <input
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          type="password"
          placeholder="Kata sandi"
          required
          className={inputClass}
        />
        {error && <p className="text-red-600 text-sm text-center">{error}</p>}
        <Button type="submit" className="mt-2">
          Masuk
        </Button>
      </form>
    </main>
  )
}
```

- [ ] **Step 2: Replace `src/routes/register.tsx`**

```tsx
import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { signUp } from '../server/auth/auth-client'
import { Button } from '#/components/ui/Button'

export const Route = createFileRoute('/register')({ component: RegisterPage })

const inputClass =
  'border-b-2 border-(--color-outline-variant) bg-(--color-surface-container-low) rounded px-4 py-3 text-(--color-on-surface) focus:border-(--color-primary) focus:outline-none transition-colors'

function RegisterPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const { error } = await signUp.email({ name, email, password })
    if (error) setError(error.message ?? 'Registrasi gagal')
    else window.location.href = '/dashboard'
  }

  return (
    <main className="bg-(--color-surface) min-h-screen flex items-center justify-center px-6">
      <form onSubmit={handleSubmit} className="w-full max-w-sm flex flex-col gap-4">
        <h1 className="font-(--font-display) text-3xl text-(--color-on-surface) text-center mb-2">
          Daftar sebagai Pengantin
        </h1>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nama"
          required
          className={inputClass}
        />
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          type="email"
          placeholder="Email"
          required
          className={inputClass}
        />
        <input
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          type="password"
          placeholder="Kata sandi"
          required
          className={inputClass}
        />
        {error && <p className="text-red-600 text-sm text-center">{error}</p>}
        <Button type="submit" className="mt-2">
          Daftar
        </Button>
      </form>
    </main>
  )
}
```

- [ ] **Step 3: Verify**

Run: `tsc --noEmit`
Expected: passes.

Functional check (per the spec, login/register are the highest-risk class-only restyle since a mistyped `className` can't break `onSubmit` logic but is worth re-confirming): register a fresh test account, confirm redirect to `/dashboard`; log out; log back in with the same credentials, confirm redirect to `/dashboard` again.

- [ ] **Step 4: Commit**

```bash
git add src/routes/login.tsx src/routes/register.tsx
git commit -m "feat: Restyle login and register forms"
```

### Task 13: GuestNameForm and FramePicker

**Files:**
- Modify: `src/components/capture/GuestNameForm.tsx`
- Modify: `src/components/capture/FramePicker.tsx`

**Interfaces:**
- Consumes: same input class string as Task 9/12; `--color-on-surface`, `--color-outline-variant`, `--color-primary` (Task 1); `Button` (Task 2, unchanged).
- Produces: unchanged props on both components.

- [ ] **Step 1: Replace `src/components/capture/GuestNameForm.tsx`**

```tsx
import { useState } from 'react'
import { Button } from '#/components/ui/Button'

export function GuestNameForm({ onSubmit }: { onSubmit: (name: string) => void }) {
  const [name, setName] = useState('')
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        if (name.trim()) onSubmit(name.trim())
      }}
      className="flex flex-col gap-4 p-6"
    >
      <label className="font-(--font-display) text-xl text-(--color-on-surface)">Siapa nama Anda?</label>
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Nama Anda"
        required
        className="border-b-2 border-(--color-outline-variant) bg-(--color-surface-container-low) rounded px-4 py-3 text-(--color-on-surface) focus:border-(--color-primary) focus:outline-none transition-colors"
      />
      <Button type="submit">Lanjut</Button>
    </form>
  )
}
```

- [ ] **Step 2: Replace `src/components/capture/FramePicker.tsx`**

```tsx
import { useEffect } from 'react'
import { RadioGroup, Radio } from '@headlessui/react'
import { Button } from '#/components/ui/Button'

type Frame = { id: string; name: string | null; objectKey: string }

export function FramePicker({
  frames,
  value,
  onChange,
  onSkip,
}: {
  frames: Frame[]
  value: string | null
  onChange: (frameId: string | null) => void
  onSkip: () => void
}) {
  // `onSkip` mutates parent state, so it must run as an effect, not during
  // render — calling it synchronously in the render body (the pre-Task-20
  // shape of this component) works today but violates React's render-purity
  // rules and emits a dev-mode warning.
  useEffect(() => {
    if (frames.length === 0) onSkip()
  }, [frames, onSkip])

  if (frames.length === 0) return null

  return (
    <div className="p-6">
      <h2 className="font-(--font-display) text-xl text-(--color-on-surface) mb-4">Pilih Bingkai (opsional)</h2>
      <RadioGroup value={value} onChange={onChange} className="grid grid-cols-3 gap-3">
        {frames.map((frame) => (
          <Radio
            key={frame.id}
            value={frame.id}
            className="border border-(--color-outline-variant) rounded p-2 cursor-pointer data-checked:border-(--color-primary)"
          >
            {/* `objectKey` here is a presigned GET URL resolved by the route
                loader, not a raw R2 object key — see index.tsx. */}
            <img src={frame.objectKey} alt={frame.name ?? ''} />
          </Radio>
        ))}
      </RadioGroup>
      <Button type="button" variant="outline" onClick={onSkip} className="mt-4">
        Tanpa Bingkai
      </Button>
    </div>
  )
}
```

- [ ] **Step 3: Verify**

Run: `tsc --noEmit`
Expected: passes.

- [ ] **Step 4: Commit**

```bash
git add src/components/capture/GuestNameForm.tsx src/components/capture/FramePicker.tsx
git commit -m "feat: Restyle guest name and frame picker steps"
```

### Task 14: CameraCapture, AudioRecorder, CapturePreview

**Files:**
- Modify: `src/components/capture/CameraCapture.tsx`
- Modify: `src/components/capture/AudioRecorder.tsx`
- Modify: `src/components/capture/CapturePreview.tsx`

**Interfaces:**
- Consumes: `--color-on-surface` (Task 1); `Button` (Task 2, unchanged). No shape changes needed in this task — these three components only use `Button` for shape-bearing elements, plus plain text.

- [ ] **Step 1: Edit `src/components/capture/CameraCapture.tsx`** — only the error-text color changes (`text-red-600` is intentionally left as-is per `DESIGN.md`'s error-text convention; no change there). Full file:

```tsx
import { useEffect, useRef, useState } from 'react'
import { resizeAndCompress } from '#/lib/image'
import { Button } from '#/components/ui/Button'

export function CameraCapture({
  onCapture,
  frameUrl,
}: {
  onCapture: (blob: Blob) => void
  frameUrl?: string | null
}) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let stream: MediaStream | null = null
    let cancelled = false

    navigator.mediaDevices
      .getUserMedia({ video: { facingMode } })
      .then((s) => {
        if (cancelled) {
          s.getTracks().forEach((t) => t.stop())
          return
        }
        stream = s
        if (videoRef.current) videoRef.current.srcObject = s
      })
      .catch(() => setError('Tidak dapat mengakses kamera. Mohon izinkan akses kamera.'))

    return () => {
      cancelled = true
      stream?.getTracks().forEach((t) => t.stop())
    }
  }, [facingMode])

  async function handleShutter() {
    if (!videoRef.current) return
    const blob = await resizeAndCompress(videoRef.current, 1600)
    onCapture(blob)
  }

  if (error) return <p className="p-6 text-red-600">{error}</p>

  return (
    <div className="relative">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="w-full aspect-[3/4] object-cover"
      />
      {frameUrl && (
        <img
          src={frameUrl}
          alt=""
          className="absolute inset-0 w-full aspect-[3/4] object-contain pointer-events-none"
        />
      )}
      <div className="flex justify-center gap-4 p-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => setFacingMode((m) => (m === 'user' ? 'environment' : 'user'))}
        >
          Balik Kamera
        </Button>
        <Button type="button" onClick={handleShutter}>
          Ambil Foto
        </Button>
      </div>
    </div>
  )
}
```

(No lines actually changed in this file relative to today — confirmed here explicitly so the executor doesn't skip verifying it. `text-(--color-fg)` doesn't appear in it at all.)

- [ ] **Step 2: Replace `src/components/capture/AudioRecorder.tsx`**

```tsx
import { useEffect, useRef, useState } from 'react'
import { pickSupportedMimeType } from '#/lib/audio-mime'
import { MAX_AUDIO_SECONDS } from '#/lib/constants'
import { Button } from '#/components/ui/Button'

export function AudioRecorder({ onRecorded }: { onRecorded: (blob: Blob, mimeType: string) => void }) {
  const [recording, setRecording] = useState(false)
  const [secondsLeft, setSecondsLeft] = useState(MAX_AUDIO_SECONDS)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const recorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const mimeTypeRef = useRef('')
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
      const recorder = recorderRef.current
      if (recorder && recorder.state !== 'inactive') {
        // Detach handlers so onRecorded/setAudioUrl don't fire after unmount.
        recorder.onstop = null
        recorder.ondataavailable = null
        recorder.stop()
        recorder.stream.getTracks().forEach((t) => t.stop())
      }
    }
  }, [])

  async function startRecording() {
    setError(null)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mimeType = pickSupportedMimeType()
      mimeTypeRef.current = mimeType
      const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined)
      chunksRef.current = []

      recorder.ondataavailable = (e) => chunksRef.current.push(e.data)
      recorder.onstop = () => {
        stream.getTracks().forEach((t) => t.stop())
        const blob = new Blob(chunksRef.current, { type: mimeTypeRef.current || 'audio/webm' })
        setAudioUrl(URL.createObjectURL(blob))
        onRecorded(blob, mimeTypeRef.current)
        if (timerRef.current) {
          clearInterval(timerRef.current)
          timerRef.current = null
        }
      }

      recorder.start()
      recorderRef.current = recorder
      setRecording(true)
      setSecondsLeft(MAX_AUDIO_SECONDS)

      timerRef.current = setInterval(() => {
        setSecondsLeft((s) => {
          if (s <= 1) {
            recorder.stop()
            setRecording(false)
            return 0
          }
          return s - 1
        })
      }, 1000)
    } catch {
      setError('Tidak dapat mengakses mikrofon. Mohon izinkan akses mikrofon.')
    }
  }

  function stopRecording() {
    recorderRef.current?.stop()
    setRecording(false)
  }

  function reRecord() {
    setAudioUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev)
      return null
    })
    setSecondsLeft(MAX_AUDIO_SECONDS)
  }

  if (error) return <p className="p-6 text-red-600">{error}</p>

  if (audioUrl) {
    return (
      <div className="flex flex-col items-center gap-3 p-4">
        <audio src={audioUrl} controls />
        <Button type="button" variant="outline" onClick={reRecord}>
          Rekam Ulang
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center gap-3 p-4">
      {recording ? (
        <>
          <p className="text-(--color-on-surface)">Merekam... {secondsLeft}s</p>
          <Button type="button" onClick={stopRecording} className="!bg-red-600">
            Berhenti
          </Button>
        </>
      ) : (
        <Button type="button" onClick={startRecording}>
          Rekam Pesan Suara (maks {MAX_AUDIO_SECONDS}s)
        </Button>
      )}
    </div>
  )
}
```

- [ ] **Step 3: Replace `src/components/capture/CapturePreview.tsx`**

```tsx
import { useEffect, useState } from 'react'
import { Button } from '#/components/ui/Button'

export function CapturePreview({
  photoBlob,
  audioUrl,
  onRetakePhoto,
  onReRecordAudio,
  onDownloadPhoto,
  onSubmit,
}: {
  photoBlob: Blob
  audioUrl: string
  onRetakePhoto: () => void
  onReRecordAudio: () => void
  onDownloadPhoto: () => void
  onSubmit: () => void
}) {
  const [photoUrl, setPhotoUrl] = useState<string | null>(null)

  // Re-derive the object URL whenever a new composited photo comes in (e.g.
  // after a retake), and revoke the previous one so it doesn't leak.
  useEffect(() => {
    const url = URL.createObjectURL(photoBlob)
    setPhotoUrl(url)
    return () => URL.revokeObjectURL(url)
  }, [photoBlob])

  return (
    <div className="flex flex-col items-center gap-4 p-6">
      {photoUrl && (
        <img
          src={photoUrl}
          alt="Pratinjau foto"
          className="w-full max-w-sm aspect-[3/4] object-cover"
        />
      )}
      <audio src={audioUrl} controls />
      <div className="flex gap-3 flex-wrap justify-center">
        <Button type="button" variant="outline" onClick={onRetakePhoto}>
          Ulangi Foto
        </Button>
        <Button type="button" variant="outline" onClick={onReRecordAudio}>
          Rekam Ulang
        </Button>
        <Button type="button" variant="outline" onClick={onDownloadPhoto}>
          Unduh Foto
        </Button>
      </div>
      <Button type="button" onClick={onSubmit} className="!px-8">
        Kirim
      </Button>
    </div>
  )
}
```

- [ ] **Step 4: Verify**

Run: `tsc --noEmit`
Expected: passes.

- [ ] **Step 5: Commit**

```bash
git add src/components/capture/CameraCapture.tsx src/components/capture/AudioRecorder.tsx src/components/capture/CapturePreview.tsx
git commit -m "feat: Restyle camera/audio capture and preview steps"
```

### Task 15: Guest landing route wrapper

**Files:**
- Modify: `src/routes/e/$eventSlug/index.tsx`

**Interfaces:**
- Consumes: `--color-surface`, `--color-on-surface`, `--color-on-surface-variant` (Task 1). All child components (`GuestNameForm`, `FramePicker`, `CameraCapture`, `AudioRecorder`, `CapturePreview`) already restyled in Tasks 13–14 — this task only touches the two `className` strings that live directly in this route file (the "acara tidak tersedia" state and the "Mengirim..." status line).

- [ ] **Step 1: Edit `src/routes/e/$eventSlug/index.tsx`** — replace the two lines below (rest of file unchanged from what's currently on disk):

Find:
```tsx
    return (
      <div className="bg-(--color-bg) min-h-screen flex items-center justify-center p-8 text-center">
        <p className="text-(--color-fg)">Acara ini tidak lagi tersedia.</p>
      </div>
    )
```

Replace with:
```tsx
    return (
      <div className="bg-(--color-surface) min-h-screen flex items-center justify-center p-8 text-center">
        <p className="text-(--color-on-surface)">Acara ini tidak lagi tersedia.</p>
      </div>
    )
```

Find:
```tsx
      {submitting && <p className="text-center text-(--color-fg-muted)">Mengirim...</p>}
```

Replace with:
```tsx
      {submitting && <p className="text-center text-(--color-on-surface-variant)">Mengirim...</p>}
```

- [ ] **Step 2: Verify**

Run: `tsc --noEmit` then `pnpm build`
Expected: both pass. This is the last file in the guest flow and touches the `createServerFn` loader boundary described in `CLAUDE.md`'s "Server/client boundary" section (unchanged by this task, but worth reconfirming with a full build before the final walkthrough).

- [ ] **Step 3: Commit**

```bash
git add src/routes/e/\$eventSlug/index.tsx
git commit -m "feat: Restyle guest landing route wrapper text"
```

---

## Cross-cutting

### Task 16: Update DESIGN.md reference sections

**Files:**
- Modify: `DESIGN.md`

The frontmatter and prose ("Brand & Style" through "Additional Components") were already rewritten before this plan started — that part is done. What's still stale is nothing else; `DESIGN.md` has no other sections referencing the old system (the old `## Tokens`/`## Components`/`## Patterns by surface` sections that referenced `--color-fg` etc. were already replaced by the frontmatter rewrite). This task is therefore a verification-only pass, not an edit:

- [ ] **Step 1: Read `DESIGN.md` top to bottom and confirm no references remain to**: `--color-bg`, `--color-fg`, `--color-fg-muted`, `--color-accent`, `Fraunces`, `Inter`, or pill-shaped buttons/inputs as the standard shape.

Expected: none found (the file was already fully rewritten to the Eternal Muse system as shown in this plan's spec). If anything is found, fix it inline to match the tokens/shapes this plan implemented.

- [ ] **Step 2: Commit** (only if Step 1 found and fixed something)

```bash
git add DESIGN.md
git commit -m "docs: Finish DESIGN.md alignment with implemented Eternal Muse system"
```

### Task 17: Final verification

**Files:** none (verification only)

- [ ] **Step 1: Full build and typecheck**

Run: `tsc --noEmit && pnpm build`
Expected: both succeed with zero errors — this is the definitive check for the client/server bundling class of bug called out in `CLAUDE.md` (any accidental server-only import reaching a client-bundled route would fail here, not in `pnpm dev`).

- [ ] **Step 2: Run the existing test suite**

Run: `pnpm test`
Expected: all existing tests still pass — this plan changed no server logic, guards, or data flow, so no test should have broken; a failure here would indicate an accidental logic change slipped into a "restyle" task.

- [ ] **Step 3: Full in-browser walkthrough**

Run `pnpm dev`, then in a browser (or via `claude-in-chrome`):
1. **Marketing** (`/`) — desktop (1440px) and mobile (390px): confirm Playfair Display heading, Ivory background, new button styles.
2. **Register → Dashboard → Logout → Login**: confirm the full auth loop still works functionally, with the new bottom-border input style and restyled buttons.
3. **Dashboard**: create an event, open it, upload a frame (PNG), view the QR card, visit settings and save a venue change. Confirm `Card`-based surfaces render with the new shadow/radius, and the sidebar/navbar shell (mobile drawer + desktop sticky sidebar) still behaves exactly as it did before this plan (per Task 5's note, `DashboardShell` itself wasn't touched).
4. **Admin** (if a test admin account is available): confirm admin list pages and the admin QR page render correctly.
5. **Guest flow** (`/e/$eventSlug`) on a mobile viewport: name → frame picker (or skip) → camera capture → audio recording → preview → submit → thank-you page. Confirm all Indonesian copy is unchanged and every step uses the new palette/shapes.

Expected: no visual regressions, no functional regressions, all Indonesian copy intact verbatim.

- [ ] **Step 4: Report**

No commit for this task (verification only) — report the walkthrough results to the user, calling out anything that didn't match expectations.
