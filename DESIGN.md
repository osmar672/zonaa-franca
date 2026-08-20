---
name: Institutional Trust
colors:
  surface: '#f8f9fa'
  surface-dim: '#d9dadb'
  surface-bright: '#f8f9fa'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f3f4f5'
  surface-container: '#edeeef'
  surface-container-high: '#e7e8e9'
  surface-container-highest: '#e1e3e4'
  on-surface: '#191c1d'
  on-surface-variant: '#444650'
  inverse-surface: '#2e3132'
  inverse-on-surface: '#f0f1f2'
  outline: '#757681'
  outline-variant: '#c5c6d2'
  surface-tint: '#475b9c'
  primary: '#00103e'
  on-primary: '#ffffff'
  primary-container: '#0a2463'
  on-primary-container: '#7a8ed2'
  inverse-primary: '#b5c4ff'
  secondary: '#006d32'
  on-secondary: '#ffffff'
  secondary-container: '#87f79f'
  on-secondary-container: '#007234'
  tertiary: '#1e1300'
  on-tertiary: '#ffffff'
  tertiary-container: '#372700'
  on-tertiary-container: '#b88900'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dce1ff'
  primary-fixed-dim: '#b5c4ff'
  on-primary-fixed: '#00164d'
  on-primary-fixed-variant: '#2e4382'
  secondary-fixed: '#8afaa2'
  secondary-fixed-dim: '#6ddd88'
  on-secondary-fixed: '#00210a'
  on-secondary-fixed-variant: '#005224'
  tertiary-fixed: '#ffdea0'
  tertiary-fixed-dim: '#fbbc06'
  on-tertiary-fixed: '#261a00'
  on-tertiary-fixed-variant: '#5c4300'
  background: '#f8f9fa'
  on-background: '#191c1d'
  surface-variant: '#e1e3e4'
  navy-deep: '#0A2463'
  emerald-growth: '#058C42'
  status-alert: '#D90429'
  slate-text: '#1E293B'
  border-subtle: '#E2E8F0'
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
    letterSpacing: 0.01em
  mono-data:
    fontFamily: JetBrains Mono
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 18px
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  base: 8px
  container-max: 1280px
  gutter: 24px
  margin-mobile: 16px
  margin-desktop: 40px
---

## Brand & Style

The design system for the platform reflects a **Corporate & Modern** identity, specifically tailored for the high-stakes environment of Free Trade Zone management. The brand personality is authoritative yet efficient, bridging the gap between rigid government bureaucracy and the agility required by international private investment.

### Visual Narrative
The UI prioritizes a **High-Density, Functional** aesthetic. It aims to evoke a sense of security and precision through a structured layout and a disciplined color palette. The goal is to reduce the cognitive load of analysts managing complex datasets while providing a transparent, professional interface for corporate entities.

### Key Principles
- **Clarity over Ornament:** Every UI element must serve a functional purpose. Minimal use of decorative icons or illustrations.
- **Institutional Authority:** Borrowing from the "PROCOMER" heritage, using deep tones and robust typography to establish legitimacy.
- **Data-Driven Transparency:** Using status indicators and progress trackers to make the "black box" of government processing visible and predictable.

## Colors

The palette is anchored in **Deep Navy Blue**, representing the stability and legal framework of the Costa Rican government. **Emerald Green** is used strategically to denote growth, successful metrics, and the national identity.

### Functional Color Application
- **Primary (Navy):** Used for navigation, primary actions, and headers. It establishes the "Institutional" frame.
- **Secondary (Emerald):** Reserved for "Aproved" statuses, successful compliance reports, and growth indicators.
- **Tertiary (Gold):** Used for "Review Required" or "IA Analysis in Progress" states.
- **Neutral (Slate/Grey):** A range of cool greys handles the density of data without creating visual fatigue. Backgrounds utilize very light greys to separate content cards from the canvas.
- **Semantic Red:** Used exclusively for non-compliance alerts and critical system errors.

## Typography

The design system utilizes **Inter** as the primary typeface for its exceptional legibility in data-heavy environments and its neutral, professional character. 

### Scale & Hierarchy
- **Headlines:** Use tighter letter spacing and semi-bold weights to create a strong visual anchor for page sections.
- **Body Text:** Standardized at 16px for optimal readability of legal and fiscal descriptions.
- **Data Labels:** Small, medium-weight labels help define form fields and table headers without competing with the actual data.
- **Technical Data:** For IDs, fiscal codes, or AI-generated scores, use a monospaced font (JetBrains Mono) to signal high-precision information.
- **Mobile Adjustments:** Large headlines (above 32px) should scale down by 20% on mobile devices while maintaining line-height ratios.

## Layout & Spacing

This design system employs a **12-column Fixed Grid** for desktop to ensure data tables and multi-step forms remain legible and don't stretch excessively on wide monitors.

### Spacing Philosophy
- **8px Base Unit:** All margins and paddings are multiples of 8px to ensure a consistent rhythmic flow.
- **Density:** In "Analyst Views," spacing is tightened to 4px/8px to allow more data on screen. In "Company Views," white space is increased to 16px/24px to provide a more guided, less overwhelming experience.
- **Breakpoints:**
  - **Desktop (1280px+):** Full 12-column layout with 24px gutters.
  - **Tablet (768px - 1279px):** 8-column layout with 16px gutters. Sidebars collapse into icons.
  - **Mobile (< 768px):** 4-column fluid layout. Multi-step forms convert to single-column stacks with a fixed progress bar at the top.

## Elevation & Depth

The design system uses **Tonal Layering** supplemented by **Low-Contrast Outlines** rather than heavy shadows to maintain a clean, "paper-like" institutional feel.

- **Level 0 (Background):** Neutral Grey (#F8F9FA). Used for the main canvas.
- **Level 1 (Cards/Surface):** Pure White (#FFFFFF) with a 1px border (#E2E8F0). This is the primary container for forms and tables.
- **Level 2 (Modals/Overlays):** White with a soft, diffused shadow (12% opacity, 16px blur, 4px Y-offset) to denote temporary interaction layers.
- **Focus States:** High-contrast 2px border in Navy-Deep to ensure keyboard accessibility.

## Shapes

The shape language is **Soft (0.25rem)**. This subtle rounding removes the harshness of a pure 0px edge—making the interface feel modern—while remaining professional enough for a government platform.

- **Small Components:** Buttons, checkboxes, and input fields use a 4px (0.25rem) radius.
- **Large Components:** Main content cards and multi-step form containers use an 8px (0.5rem) radius to create a distinct grouping of information.
- **Status Pills:** Use a full "Pill" shape (999px radius) to differentiate them from actionable buttons.

## Components

### Buttons
- **Primary:** Solid Navy-Deep with white text. Used for "Submit" or "Approve."
- **Secondary:** Emerald-Growth outline. Used for "Download Report" or "Add Attachment."
- **Ghost:** Text-only with Slate-Grey. Used for "Cancel" or "Go Back."

### Professional Tables
- **Header:** Light grey background (#F1F5F9) with Uppercase Label-SM text.
- **Cells:** High contrast text with 48px row heights to ensure touch targets and legibility.
- **Status Indicators:** Pills with low-opacity backgrounds and high-saturation text (e.g., Light Green bg with Dark Green text for "Compliant").

### Multi-Step Forms
- **Progress Tracker:** Horizontal stepper at the top of the card. Completed steps show a Green checkmark; current step shows a Navy ring.
- **Validation:** Inline error messages in Status-Alert Red (#D90429), appearing only after the user has interacted with the field.

### AI Score Cards
- A specialized component that displays the IA-generated affinity score (0-100) using a radial gauge. It must include a "Justification" toggle that expands to show the underlying logic (e.g., "Inversion threshold not met").

### Input Fields
- Structured with a persistent label above the field. Help text is provided below the field in a smaller, lighter font-weight to guide the user without cluttering the form.