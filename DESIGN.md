---
name: Eternal Muse
colors:
  surface: '#fafaeb'
  surface-dim: '#dbdbcd'
  surface-bright: '#fafaeb'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f4f5e6'
  surface-container: '#efefe0'
  surface-container-high: '#e9e9db'
  surface-container-highest: '#e3e3d5'
  on-surface: '#1b1c14'
  on-surface-variant: '#4c463f'
  inverse-surface: '#2f3128'
  inverse-on-surface: '#f1f2e3'
  outline: '#7e766e'
  outline-variant: '#cfc5bc'
  surface-tint: '#665d53'
  primary: '#665d53'
  on-primary: '#ffffff'
  primary-container: '#f3e5d8'
  on-primary-container: '#70665b'
  inverse-primary: '#d1c4b8'
  secondary: '#496455'
  on-secondary: '#ffffff'
  secondary-container: '#ccead6'
  on-secondary-container: '#4f6a5b'
  tertiary: '#70585b'
  on-tertiary: '#ffffff'
  tertiary-container: '#ffe0e3'
  on-tertiary-container: '#7a6164'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#eee0d3'
  primary-fixed-dim: '#d1c4b8'
  on-primary-fixed: '#211a13'
  on-primary-fixed-variant: '#4e453c'
  secondary-fixed: '#ccead6'
  secondary-fixed-dim: '#b0cdbb'
  on-secondary-fixed: '#062014'
  on-secondary-fixed-variant: '#324c3e'
  tertiary-fixed: '#fbdbde'
  tertiary-fixed-dim: '#debfc2'
  on-tertiary-fixed: '#281719'
  on-tertiary-fixed-variant: '#574144'
  background: '#fafaeb'
  on-background: '#1b1c14'
  surface-variant: '#e3e3d5'
typography:
  display-lg:
    fontFamily: Playfair Display
    fontSize: 48px
    fontWeight: '700'
    lineHeight: '1.2'
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Playfair Display
    fontSize: 32px
    fontWeight: '600'
    lineHeight: '1.3'
  headline-lg-mobile:
    fontFamily: Playfair Display
    fontSize: 28px
    fontWeight: '600'
    lineHeight: '1.3'
  headline-md:
    fontFamily: Playfair Display
    fontSize: 24px
    fontWeight: '500'
    lineHeight: '1.4'
  body-lg:
    fontFamily: Montserrat
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Montserrat
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
  label-md:
    fontFamily: Montserrat
    fontSize: 14px
    fontWeight: '600'
    lineHeight: '1.2'
    letterSpacing: 0.05em
  caption:
    fontFamily: Montserrat
    fontSize: 12px
    fontWeight: '400'
    lineHeight: '1.4'
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 8px
  container-max: 1440px
  gutter: 24px
  margin-mobile: 16px
  margin-desktop: 64px
---

## Brand & Style

The design system is centered on the concept of "Modern Romance." It targets couples planning high-end, bespoke weddings, evoking an emotional response of serenity, excitement, and luxury. The aesthetic is **Minimalist-Elegant**, characterized by generous white space, intentional alignment, and a refined editorial feel. 

The UI should feel like a premium physical invitation—tactile yet digital. It utilizes a soft-focus approach with high-quality photography as a primary design element, framed by structured, airy layouts. The visual language avoids clutter, opting for thin lines and subtle transitions to maintain a "breathable" and celebratory atmosphere.

## Colors

The palette is anchored in **Clean Ivory (#FFFFF0)** for primary backgrounds to provide a warmer, more sophisticated feel than pure white. **Soft Champagne (#F3E5D8)** serves as the primary functional color, used for secondary surfaces, subtle hover states, and structural dividers. 

**Deep Forest Green (#2D4739)** provides high-contrast accents for primary actions, navigation, and critical information, grounding the softer tones with a sense of timelessness. **Blush Pink (#FADADD)** is used sparingly for highlights, status indicators, or decorative elements to inject a romantic warmth without overwhelming the professional layout.

## Typography

This design system employs a classic serif/sans-serif pairing to balance tradition with modernity. **Playfair Display** is used for all headlines and display text, utilizing its high-contrast strokes to convey luxury. For large display titles, a slight negative letter-spacing is applied to enhance the editorial feel.

**Montserrat** handles all functional and body text. Its geometric clarity ensures legibility across dense dashboard data (like guest lists or budget trackers). Labels use a slightly heavier weight and increased letter-spacing in uppercase to create clear hierarchy without needing large font sizes.

## Layout & Spacing

The layout follows a **Fixed Grid** philosophy on desktop to maintain the high-end editorial look, centering content within a 1440px max-width container. A 12-column system is used with generous 24px gutters.

Spacing follows an 8px rhythm. Significant vertical "breathing room" is prioritized; sections are separated by large margins (64px+) to prevent the interface from feeling crowded. On mobile, the grid collapses to a single column with 16px side margins, while padding within cards remains generous to maintain the airy aesthetic.

## Elevation & Depth

Elevation in this design system is communicated through **Ambient Shadows** and **Tonal Layering** rather than heavy borders. 

Surfaces use a very soft, diffused shadow (Blur: 20px, Opacity: 4%, Color: Forest Green) to give the impression of paper floating slightly above a surface. High-priority interactive elements may use a subtle inner-glow in Champagne to suggest a pressed or tactile feel. Backdrop blurs (Glassmorphism) are reserved for navigation overlays and modal backgrounds to maintain a sense of depth while keeping the focus on the underlying photography.

## Shapes

The shape language is **Rounded**, utilizing a 0.5rem (8px) base radius. This softening of corners mirrors the organic nature of floral arrangements and wedding attire. 

- **Standard Buttons & Inputs**: 8px (rounded-md)
- **Cards & Large Containers**: 16px (rounded-lg)
- **Profile Images & Status Tags**: Fully circular (pill-shaped) to provide visual contrast against the structured grid.

## Components

### Buttons
Primary buttons use a solid Forest Green background with Ivory text, featuring a subtle 1px Champagne border on hover. Secondary buttons are outlined in Forest Green or are solid Ivory with a soft shadow.

### Cards
Cards are the primary container. They feature Ivory backgrounds, no borders, and soft ambient shadows. When used for "Venue" or "Inspiration" blocks, the top half of the card should be a full-bleed image with the typography nestled in generous padding below.

### Input Fields
Inputs are minimalist, using a bottom-border-only style or a very light Champagne background with an 8px radius. Focus states are indicated by a Forest Green bottom border transition.

### Chips & Tags
Used for guest RSVPs or vendor categories. These should use the Blush Pink or Champagne colors with "Label-MD" typography.

### Progress Indicators
Budget and task trackers should use thin, elegant lines. The "filled" portion of a progress bar uses a Forest Green to Blush Pink gradient to represent progress towards the wedding day.

### Additional Components
- **Countdown Timer**: A bespoke component using large Playfair Display numbers for the wedding date.
- **Image Masonry**: A specialized layout component for mood boards, using varying aspect ratios with consistent 16px spacing.
