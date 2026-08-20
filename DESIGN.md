# DESIGN.md

Visual design system for Wedding Moment, derived from `src/styles.css` and current component usage. Read this before adding or changing UI — new screens should reuse these tokens and patterns rather than introducing new ones.

## Tokens

Defined in `src/styles.css` under `@theme` (Tailwind v4 CSS-variable theming — reference as `bg-(--color-x)`, `text-(--color-x)`, `font-(--font-x)`, not hardcoded hex/class names):

| Token | Value | Use |
|---|---|---|
| `--color-bg` | `#e8e6e1` (cream) | Page background |
| `--color-fg` | `#1a2e1a` (dark green) | Primary text, borders, primary-button fill |
| `--color-fg-muted` | `#3f4f3f` (muted green) | Secondary text (captions, helper copy, status text) |
| `--color-accent` | `#e8425a` (coral/red) | Sparingly — accent badges only (e.g. the heart badge) |
| `--font-display` | Fraunces (serif) | Headings only |
| `--font-sans` | Inter | Body text, default (set on `body`) |

There is no dark mode — the palette is fixed cream/green, not theme-conditional. Don't introduce `dark:` variants or alternate color tokens.

## Typography

- Headings: `font-(--font-display)`, typically `uppercase`, `tracking-tight`, large sizes (`text-4xl sm:text-6xl` for hero, `text-xl` for form labels/section titles).
- Body/UI text: default sans (Inter), `text-(--color-fg)` for primary, `text-(--color-fg-muted)` for secondary/helper text.
- Errors: plain `text-red-600` (not a themed token — kept distinct from the palette so errors are unambiguous).

## Shape & spacing

- Buttons and pill-style inputs: `rounded-full`.
- Cards and larger containers: `rounded-2xl`, inner elements (e.g. a card's image) `rounded-xl`.
- Standard button padding: `px-6 py-3`. Standard card padding: `p-3`. Form padding: `p-6`.
- Layout gaps use Tailwind's `gap-*` scale (`gap-2` within tight clusters like a card, `gap-4`–`gap-6` between form fields, `gap-6` in page-level flex columns).
- Page containers: `min-h-screen`, content capped with `max-w-4xl mx-auto` (marketing) or `min(42rem, calc(100% - 2rem))` via the global `main` selector (default content width elsewhere).

## Components (`src/components/ui/`)

- **`Button` / `LinkButton`** (`Button.tsx`) — the only button primitives. Two variants:
  - `primary` (default): solid `bg-(--color-fg)` fill, `text-(--color-bg)` text, `hover:opacity-90`.
  - `outline`: `border border-(--color-fg)`, `text-(--color-fg)`, `hover:bg-(--color-fg)/5`.
  - Both share a `base` class (`inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 font-medium text-center transition disabled:opacity-50 disabled:cursor-not-allowed`). Use `Button` for form submits/in-page actions, `LinkButton` for navigation — never a raw `<a>`/`<button>` styled ad hoc.
- **`Badge`** (`Badge.tsx`) — circular accent dot (`w-10 h-10 rounded-full bg-(--color-accent) text-white`), used for the heart icon and similar single-glyph accents. This is the only place `--color-accent` should appear.

Reuse these two primitives for any new button or accent-dot need before writing new classes.

## Patterns by surface

- **Marketing/landing** (`src/routes/index.tsx`): centered column, `Badge` → display heading → muted subtext → `LinkButton` row. Text-centered, generous vertical rhythm (`gap-6`, `py-16`).
- **Guest capture flow** (`src/components/capture/*`, `src/routes/e/$eventSlug/*`): single-column, mobile-first, step-by-step (name → frame → photo → audio → preview → submit). Forms are plain stacked `flex flex-col gap-4` with pill inputs (`rounded-full border border-(--color-fg)/30 px-4 py-3 bg-(--color-bg)`). All copy is in Indonesian — keep new guest-facing strings in Indonesian for consistency (submit errors, labels, placeholders all follow this).
- **Dashboard** (`src/components/dashboard/*`): card-based grids. `SubmissionCard` is the canonical card shape: `border border-(--color-fg) rounded-2xl p-3 flex flex-col gap-2`, with a full-width `rounded-xl` image, `font-medium` name, and a full-width `<audio>` control.

## Conventions to preserve

- Always reference color/font via the CSS-variable Tailwind syntax (`bg-(--color-bg)`, `font-(--font-display)`), never literal Tailwind palette classes (`bg-stone-100` etc.) or inline hex — keeps the palette centrally editable from `styles.css`.
- Don't add new color tokens without strong reason; the palette is intentionally small (bg/fg/fg-muted/accent).
- Guest-facing copy: Indonesian. Code/comments: English.
