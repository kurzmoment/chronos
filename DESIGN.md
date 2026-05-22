---
name: Cyber-Premium
colors:
  surface: '#0b1326'
  surface-dim: '#0b1326'
  surface-bright: '#31394d'
  surface-container-lowest: '#060e20'
  surface-container-low: '#131b2e'
  surface-container: '#171f33'
  surface-container-high: '#222a3d'
  surface-container-highest: '#2d3449'
  on-surface: '#dae2fd'
  on-surface-variant: '#c7c4d7'
  inverse-surface: '#dae2fd'
  inverse-on-surface: '#283044'
  outline: '#908fa0'
  outline-variant: '#464554'
  surface-tint: '#c0c1ff'
  primary: '#c0c1ff'
  on-primary: '#1000a9'
  primary-container: '#8083ff'
  on-primary-container: '#0d0096'
  inverse-primary: '#494bd6'
  secondary: '#4cd7f6'
  on-secondary: '#003640'
  secondary-container: '#03b5d3'
  on-secondary-container: '#00424e'
  tertiary: '#d0bcff'
  on-tertiary: '#3c0091'
  tertiary-container: '#a078ff'
  on-tertiary-container: '#340080'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#e1e0ff'
  primary-fixed-dim: '#c0c1ff'
  on-primary-fixed: '#07006c'
  on-primary-fixed-variant: '#2f2ebe'
  secondary-fixed: '#acedff'
  secondary-fixed-dim: '#4cd7f6'
  on-secondary-fixed: '#001f26'
  on-secondary-fixed-variant: '#004e5c'
  tertiary-fixed: '#e9ddff'
  tertiary-fixed-dim: '#d0bcff'
  on-tertiary-fixed: '#23005c'
  on-tertiary-fixed-variant: '#5516be'
  background: '#0b1326'
  on-background: '#dae2fd'
  surface-variant: '#2d3449'
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 48px
    fontWeight: '800'
    lineHeight: '1.1'
    letterSpacing: -0.04em
  headline-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '700'
    lineHeight: '1.2'
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '700'
    lineHeight: '1.3'
    letterSpacing: -0.02em
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
    letterSpacing: -0.01em
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.5'
    letterSpacing: -0.01em
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: '1'
    letterSpacing: 0.02em
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 28px
    fontWeight: '700'
    lineHeight: '1.2'
    letterSpacing: -0.02em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 4px
  gutter: 24px
  margin-mobile: 16px
  margin-desktop: 48px
  container-max: 1440px
---

## Brand & Style
This design system embodies a "Cyber-Premium" aesthetic—a sophisticated intersection of high-performance technology and luxury minimalism. The target audience includes power users, developers, and data specialists who value precision, speed, and aesthetic refinement. 

The visual narrative moves away from organic AI metaphors toward a rigorous, data-driven "System Metrics" philosophy. The UI should feel like a high-end cockpit: focused, high-contrast, and impeccably organized. We leverage a mix of **Minimalism** and **Glassmorphism**, utilizing deep atmospheric depth and vibrant technical accents to signal state and priority.

## Colors
The palette is rooted in a deep, nocturnal neutral base to provide maximum contrast for neon-inflected accents.
- **Primary & Secondary:** A vibrant transition from Electric Indigo to Cyan, used primarily for interactive states and "Performance" indicators.
- **Tertiary:** Deep Violet is reserved for secondary status metrics and decorative depth.
- **Surface Strategy:** Backgrounds utilize a true black or near-black (`#020617`), while interactive surfaces use semi-transparent glass layers to create a sense of stacked instrumentation.

## Typography
The system relies exclusively on **Inter** to maintain a systematic, technical feel. 
- **Tracking:** A global tightening of tracking (-0.02em) is applied to all headings to create a dense, premium appearance.
- **Casing Strategy:** Use lowercase exclusively for secondary labels, metadata, and status tags to imply a streamlined, "code-like" efficiency. Uppercase is reserved sparingly for top-level Display headers to denote authority.
- **Styling:** Primary headings should frequently utilize the Indigo-to-Cyan gradient to draw the eye to core system metrics.

## Layout & Spacing
The layout follows a **Fixed Grid** model on desktop (12 columns) and a **Fluid Grid** on mobile. 
- **Rhythm:** A strict 4px baseline grid ensures technical precision.
- **Margins:** Generous outer margins (48px+) on desktop emphasize the "Minimalist" brand pillar, centering the focus on high-impact data clusters.
- **Reflow:** On mobile, glass cards should transition to full-width with reduced padding (16px) to maximize screen real estate for performance charts.

## Elevation & Depth
Depth is achieved through "Elevated Glass" layers rather than traditional shadows.
- **Backdrop Blur:** All cards and modals must feature a minimum `20px` backdrop blur to separate foreground elements from the dark background.
- **Micro-Borders:** Every glass surface is defined by a `0.5px` solid border (Color: Primary at 20% opacity) to create a "machined" edge.
- **Multi-layered Shadows:** Use a combination of a tight, dark inner shadow for depth and a soft, diffused ambient glow that inherits the color of the accent gradient (e.g., a faint cyan glow for active components).

## Shapes
The shape language balances the "Cyber" (sharp/technical) with "Premium" (smooth/approachable). 
- **Radius:** A base radius of `16px` (rounded-lg) is used for all primary containers and glass cards. 
- **Interactive Elements:** Buttons and input fields utilize the `8px` (rounded-md) standard to maintain a tighter, more functional look within the softer layout containers.

## Components
- **Buttons:** Primary buttons use the accent gradient background with white text. Secondary buttons use the `0.5px` micro-border with a subtle glass fill.
- **Glow Status Indicators:** Instead of flat icons, use "Glow Dots"—small circular indicators with a `4px` outer blur to represent system status (Online, Error, Processing).
- **Cards:** Must include the `20px` blur and the `0.5px` border. Headers within cards should use the `label-sm` (lowercase) style for metadata.
- **Input Fields:** Dark, recessed backgrounds with a `1px` bottom-only highlight that expands to the full border on focus using the Cyan accent.
- **System Metrics:** Use monospaced numerical readouts within cards to emphasize "Performance" over "Intelligence."