---
name: Trinidense Elite
colors:
  surface: '#121414'
  surface-dim: '#121414'
  surface-bright: '#38393a'
  surface-container-lowest: '#0c0f0f'
  surface-container-low: '#1a1c1c'
  surface-container: '#1e2020'
  surface-container-high: '#282a2b'
  surface-container-highest: '#333535'
  on-surface: '#e2e2e2'
  on-surface-variant: '#c3c6d5'
  inverse-surface: '#e2e2e2'
  inverse-on-surface: '#2f3131'
  outline: '#8d909e'
  outline-variant: '#434653'
  surface-tint: '#b1c5ff'
  primary: '#b1c5ff'
  on-primary: '#002c70'
  primary-container: '#3366cc'
  on-primary-container: '#e7ebff'
  inverse-primary: '#2259bf'
  secondary: '#ffecc0'
  on-secondary: '#3d2f00'
  secondary-container: '#fecb00'
  on-secondary-container: '#6e5700'
  tertiary: '#c8c6c5'
  on-tertiary: '#313030'
  tertiary-container: '#6b6a6a'
  on-tertiary-container: '#eeebea'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#d9e2ff'
  primary-fixed-dim: '#b1c5ff'
  on-primary-fixed: '#001946'
  on-primary-fixed-variant: '#00419d'
  secondary-fixed: '#ffe08b'
  secondary-fixed-dim: '#f1c100'
  on-secondary-fixed: '#241a00'
  on-secondary-fixed-variant: '#584400'
  tertiary-fixed: '#e5e2e1'
  tertiary-fixed-dim: '#c8c6c5'
  on-tertiary-fixed: '#1c1b1b'
  on-tertiary-fixed-variant: '#474746'
  background: '#121414'
  on-background: '#e2e2e2'
  surface-variant: '#333535'
typography:
  display:
    fontFamily: Noto Serif
    fontSize: 56px
    fontWeight: '700'
    lineHeight: '1.1'
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Noto Serif
    fontSize: 32px
    fontWeight: '600'
    lineHeight: '1.2'
  headline-lg-mobile:
    fontFamily: Noto Serif
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.2'
  headline-md:
    fontFamily: Noto Serif
    fontSize: 24px
    fontWeight: '500'
    lineHeight: '1.3'
  body-lg:
    fontFamily: Hanken Grotesk
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Hanken Grotesk
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.5'
  label-sm:
    fontFamily: Geist
    fontSize: 12px
    fontWeight: '600'
    lineHeight: '1'
    letterSpacing: 0.05em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  base: 8px
  gutter: 24px
  margin-mobile: 16px
  margin-desktop: 48px
  container-max: 1280px
---

## Brand & Style

The design system is a high-performance, dark-mode interface inspired by the legacy and energy of Sportivo Trinidense. It blends the traditional authority of the club’s crest with a futuristic, high-tech sports aesthetic. The visual narrative is defined by "Athletic Precision"—combining the rich, intellectual feel of serif typography with the sleek, data-driven look of technical interfaces.

The design style is **Corporate / Modern** with a **High-Tech** edge. It utilizes deep tonal layering, sharp accents, and a "Command Center" feel to evoke a sense of professional excellence and elite sports analysis. The interface should feel premium, exclusive, and operationally focused.

## Colors

The palette is anchored in the club’s identity, optimized for a high-contrast dark environment.

- **Primary (Deep Blue):** #3366cc. Used for core branding elements, active states, and structural highlights.
- **Secondary (Vibrant Gold):** #FFCC00. Reserved for high-importance calls to action, success metrics, and premium accents. It provides a sharp, energetic contrast against the dark background.
- **Surface & Backgrounds:** We utilize a "Midnight" scale starting at #0A0A0A for the base, with #1A1A1A and #262626 used for container layering.
- **Typography:** Headlines utilize the secondary gold or pure white to ensure maximum legibility. Body text stays in the "Off-white" (#F5F5F5) range to reduce eye strain in low-light environments.

## Typography

The typography system creates a "Traditional meets Technical" hierarchy. 

**Noto Serif** is used for all headlines and display text, lending an air of established authority and "club history" to the interface. 

**Hanken Grotesk** serves as the primary body face, providing a clean, contemporary contrast that is highly readable in long-form data. 

**Geist** is used for labels, data points, and technical UI elements. Its monospaced-leaning character reinforces the high-tech, analytical nature of the platform.

## Layout & Spacing

This design system employs a **Fluid Grid** model built on an 8px base unit. 

- **Desktop:** 12-column grid with 24px gutters and 48px side margins. 
- **Tablet:** 8-column grid with 24px gutters and 32px side margins.
- **Mobile:** 4-column grid with 16px gutters and 16px side margins.

The layout should feel spacious yet structured. Content is organized into "Modules" or "Cards" that snap to the grid. Use generous vertical padding (64px+) between major sections to emphasize the premium, editorial feel of the serif headlines.

## Elevation & Depth

Depth is achieved through **Tonal Layering** and subtle **Ambient Shadows**, avoiding heavy skeuomorphism in favor of a sophisticated "Glass-on-Black" look.

1.  **Level 0 (Base):** #0A0A0A. The canvas.
2.  **Level 1 (Cards/Containers):** #1A1A1A. Features a 1px border of #333333 to define edges without high-contrast lines.
3.  **Level 2 (Popovers/Modals):** #262626. These surfaces use an extra-diffused shadow: `0 12px 32px rgba(0, 0, 0, 0.5)`.

To emphasize the high-tech feel, use a subtle **Primary Tint** in the shadows of active elements (e.g., a faint #3366cc glow behind an active primary button).

## Shapes

The shape language is **Soft (0.25rem)**. This slight rounding provides a modern touch while maintaining the disciplined, architectural feel of a professional sports organization. 

- **Small elements (Inputs, Buttons):** 4px radius.
- **Medium elements (Cards, Modals):** 8px radius.
- **Data visualizers:** Sharp 90-degree corners for charts and graphs to emphasize technical accuracy.

## Components

### Buttons
- **Primary:** Solid #FFCC00 (Gold) with Black text. This is the "high-action" button.
- **Secondary:** Deep Blue (#3366cc) outline with White text.
- **Ghost:** Transparent background with Blue or White text for utility actions.

### Input Fields
Dark backgrounds (#1A1A1A) with a 1px #333333 border. Upon focus, the border transitions to Primary Blue (#3366cc) with a subtle outer glow.

### Cards
Cards use the Level 1 surface (#1A1A1A). Header areas within cards should utilize the Noto Serif font at a medium weight to maintain the brand's editorial feel.

### Data Chips & Tags
Technical indicators should use the **Geist** font. Success states use Green-tinted backgrounds, while Warning states use the club's Vibrant Gold.

### Lists
Interactive lists feature a "Slide-in" hover state where the background shifts from #1A1A1A to a very subtle Blue-tinted grey (#1E2530), indicating interactivity.