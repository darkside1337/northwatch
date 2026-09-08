---
name: Horological Restraint
tokens:
  colors:
    surface: "#FAF9F6"
    surface-dim: "#DBDAD7"
    surface-bright: "#FFFFFF"
    surface-container-lowest: "#FFFFFF"
    surface-container-low: "#F4F3F0"
    surface-container: "#EFECE6"
    surface-container-high: "#E8E4DD"
    on-surface: "#141413"
    on-surface-variant: "#595854"
    outline: "#DCD8D0"
    outline-variant: "#E8E5DF"
    primary: "#141413"
    on-primary: "#FFFFFF"
    primary-hover: "#2A2A28"
    accent: "#3B4436"
    accent-muted: "#606C5A"
    error: "#9E2A2B"
  typography:
    family-serif: "Cormorant Garamond, EB Garamond, Freight Display, Georgia, serif"
    family-sans: "Inter, Neue Haas Grotesk, -apple-system, sans-serif"
    family-mono: "JetBrains Mono, SF Mono, Consolas, monospace"
    scale:
      wordmark:
        {
          size: "1.5rem",
          weight: 500,
          tracking: "0.28em",
          lineHeight: 1.0,
          case: "uppercase",
        }
      eyebrow:
        {
          size: "0.6875rem",
          weight: 600,
          tracking: "0.16em",
          lineHeight: 1.2,
          case: "uppercase",
        }
      h1:
        { size: "3.75rem", weight: 400, tracking: "-0.01em", lineHeight: 1.05 }
      h2: { size: "2.5rem", weight: 400, tracking: "0em", lineHeight: 1.15 }
      h3: { size: "1.875rem", weight: 400, tracking: "0em", lineHeight: 1.25 }
      body-primary:
        { size: "1rem", weight: 400, tracking: "0em", lineHeight: 1.6 }
      body-secondary:
        { size: "0.875rem", weight: 400, tracking: "0.01em", lineHeight: 1.5 }
      spec-label:
        { size: "0.75rem", weight: 600, tracking: "0.05em", lineHeight: 1.3 }
      button:
        {
          size: "0.75rem",
          weight: 600,
          tracking: "0.12em",
          lineHeight: 1.0,
          case: "uppercase",
        }
  radius:
    none: "0px"
    subtle: "2px"
  spacing:
    base: "4px"
    xs: "8px"
    sm: "12px"
    md: "16px"
    lg: "24px"
    xl: "32px"
    2xl: "48px"
    section-sm: "96px"
    section-lg: "128px"
---

# Design System: Horological Restraint (Northwatch)

## 1. Brand & Style

Northwatch expresses Scandinavian minimalism, Swiss mechanical precision, and quiet luxury. The aesthetic feels like a boutique horology journal rather than a high-volume ecommerce site.

Form rigorously follows mechanical necessity. Visual balance relies on structured white space, deliberate line weights, and high-contrast typography rather than decorative flourishes. Surfaces recall physical watch materials: cold-rolled 316L stainless steel, basalt slate, vegetable-tanned leather, and anti-reflective crystal.

### Strict Negative Rules

- **Gradients**: Disallowed. No linear or radial color shifts on backgrounds, text, or CTAs.
- **Glassmorphism & Depth**: Disallowed. No backdrop blurs (`backdrop-blur`), translucent overlays, or soft drop-shadow elevations (`shadow-lg`, `shadow-2xl`). Hairline borders handle all separation.
- **Color Distraction**: Disallowed. No saturated neons, purple-to-blue SaaS transitions, or promotional banners.
- **Roundness**: Disallowed. No pill buttons (`rounded-full`) or cards exceeding `radius.subtle` (`2px`).

---

## 2. Color Palette & Token Decisions

Every token represents a role-based architectural surface, border, or text weight.

- `surface` (`#FAF9F6`): Base canvas for all storefront pages. Warmer than pure digital white to evoke uncoated fine paper.
- `surface-dim` (`#DBDAD7`): Structural break surfaces, drawer underlays, and table row alternate fills.
- `surface-container-lowest` (`#FFFFFF`): Isolated product photography viewports, modal containers, and text input backgrounds.
- `surface-container` (`#EFECE6`): Architectural specs, comparison modules, and receipt rows.
- `on-surface` (`#141413`): Highest-density ink. Used for headlines, body copy, icons, and primary buttons. Never dilute with opacity hacks.
- `on-surface-variant` (`#595854`): Mid-density charcoal for technical readouts, secondary labels, and out-of-stock indicators.
- `outline` (`#DCD8D0`): Primary `1px` structural boundary. Replaces box shadows across all cards, drawers, and headers.
- `outline-variant` (`#E8E5DF`): Ultra-fine dividers separating internal card rows or table specs.
- `accent` (`#3B4436`): Deep horological olive green. Confined to stock indicator pips, active tab highlights, and checkout step indicators.
- `error` (`#9E2A2B`): Restrained crimson for checkout validation and stock depletion notices. Used only on field error states.

---

## 3. Typography & Typesetting

Typography creates tension between artisanal horology (Editorial Serif) and instrument-grade utility (Grotesk and Monospace).

### Families

- **Display & Section Headlines**: Editorial Serif (`Cormorant Garamond`, `EB Garamond`, `Freight Display`). Elegant, balanced, and strictly restrained to titles.
- **Body, Navigation & Forms**: Precision Grotesk (`Inter`, `Neue Haas Grotesk`). Neutral, legible, and unstylized.
- **Instrument Calibrations**: Tabular Monospace (`JetBrains Mono`, `SF Mono`). Used for serial tags, tolerance parameters, order IDs, and coordinate indexes.

### Hierarchy & Application

- **Wordmark**: `typography.scale.wordmark` (`1.5rem` / `500` / tracking `+0.28em` / uppercase). Set in Serif. Followed by a static `accent` dot.
- **Section Eyebrows**: `typography.scale.eyebrow` (`0.6875rem` / `600` / tracking `+0.16em` / uppercase). Grotesk. Positioned `spacing.xs` above major headlines.
- **Headlines (H1/H2/H3)**: Editorial Serif with tight, disciplined leading (`1.05` to `1.25`). Avoid bold weights; rely on scale for presence.
- **Technical Spec Labels**: `typography.scale.spec-label` (`0.75rem` / `600`). Uppercase or mixed Grotesk, paired with tabular mono values.
- **Numeric Prices**: Always render with tabular numbers (`font-variant-numeric: tabular-nums`) to preserve alignment across grids and cart line items.

---

## 4. Spacing, Geometry & Structural Layout

- **Max Canvas Width**: `1280px` (`max-w-7xl`), centered with fluid horizontal margins (`spacing.lg` on mobile, `spacing.2xl` on desktop).
- **Vertical Cadence**:
  - Hero to next section: `spacing.section-lg` (`128px`).
  - Major section spacing: `spacing.section-sm` (`96px`).
  - Interior container padding: `spacing.lg` (`24px`) to `spacing.xl` (`32px`).
- **Structural Division**: Use `1px solid tokens.colors.outline` rather than drop shadows. Sections divide via explicit lines or shifts between `surface` and `surface-container-low`.
- **Corners**:
  - Interactive controls (Buttons, Inputs, Selects): `radius.none` (`0px`).
  - Surfaces (Cards, Drawers, Modals): `radius.none` (`0px`) to maximum `radius.subtle` (`2px`).

---

## 5. UI Components & Interaction States

### Buttons & Interactive Controls

#### Primary Action (Add to Cart, Complete Order)

- **Default**: Background `tokens.colors.primary`, text `tokens.colors.on-primary`, font `typography.scale.button`, `radius.none`. Padding: `14px 28px`.
- **Hover**: Background shifts to `tokens.colors.primary-hover` (`#2A2A28`). No vertical lift (`translate-y`) and no outer shadow.
- **Active**: Background `#000000`.
- **Focus**: `2px solid tokens.colors.accent` offset by `2px`.
- **Disabled**: Background `tokens.colors.surface-dim`, text `tokens.colors.on-surface-variant`, cursor `not-allowed`.
- **Loading**: Maintain width. Replaces label with a minimal circular spinner or static `"PROCESSING..."` text in `button` typography scale.

#### Secondary Action (View Catalog, Outline Options)

- **Default**: Background transparent, border `1px solid tokens.colors.outline`, text `tokens.colors.on-surface`.
- **Hover**: Border transitions to `tokens.colors.on-surface`, text remains unchanged.
- **Active / Selected**: Border `1px solid tokens.colors.on-surface`, subtle fill `tokens.colors.surface-container`.

#### Text Links & Product Navigation

- **Default**: Text `tokens.colors.on-surface`, hairline underline `1px solid transparent`, gap `4px`.
- **Hover**: Hairline underline becomes `tokens.colors.on-surface`. Includes arrow glyph (`→`) with a horizontal transition (`translate-x-1`, `200ms ease-out`).

---

### Form Controls & Inputs (Checkout, Shipping, Search)

- **Text Inputs & Selects**:
  - **Default**: Background `tokens.colors.surface-container-lowest`, border `1px solid tokens.colors.outline`, text `tokens.colors.on-surface`, `radius.none`. Padding: `12px 16px`.
  - **Focus**: Border color changes to `tokens.colors.on-surface`. No outer glow ring; clean hairline change only.
  - **Error State**: Border `1px solid tokens.colors.error`. Accompanying inline error copy in `tokens.colors.error` (`0.75rem`, regular).
  - **Disabled**: Background `tokens.colors.surface-container`, border `1px solid tokens.colors.outline-variant`, text `tokens.colors.on-surface-variant`.

---

### Product Display Cards (`features/catalog`)

- **Aspect Ratio**: Strict `1:1` or `4:5` vertical ratio.
- **Viewport**: Encased in `1px solid tokens.colors.outline`. Background `tokens.colors.surface-container-lowest` or flat studio slate. Watch imagery centered with balanced internal padding (`spacing.lg`).
- **Hierarchy**:
  1.  Catalog Reference: Microtag (`NW-01-GMT`) in Monospace uppercase, `tokens.colors.on-surface-variant`.
  2.  Title: Editorial Serif (`20px`), `tokens.colors.on-surface`.
  3.  Specs: Grotesk (`13px`), muted line listing case diameter, movement, strap (`40mm / Automatic / Horween Calf`).
  4.  Footer: Price in Grotesk Tabular (`$740`) adjacent to inventory indicator (a `6px` circular pip in `tokens.colors.accent` followed by `"In Stock"`).
- **Hover Behavior**: Smooth, subtle image scale (`scale-[1.02]`, `400ms cubic-bezier(0.16, 1, 0.3, 1)`). No card elevation. An outline transition shifts border from `tokens.colors.outline` to `tokens.colors.on-surface-variant`.

---

### Slide-Out Cart Drawer (`features/cart`)

- **Container**: Positioned flush to the right viewport. Width: `440px` max, height `100vh`. Background `tokens.colors.surface`, border-left `1px solid tokens.colors.outline`.
- **Overlay**: Backdrop scrim at `#141413` with `40%` opacity (`rgba(20, 20, 19, 0.4)`). Strictly no backdrop blur.
- **Header**: Title `"YOUR SELECTION"` in Serif (`18px`), accompanied by item count in brackets (`[2]`), and a minimal close glyph (`✕`).
- **Line Items**: Divided by `1px solid tokens.colors.outline-variant`. Features thumbnail, title, selected variant parameters, tabular price, and a minimalist quantity stepper (`- 1 +`).
- **Footer**: Sticky bottom block. Subtotal line with price, shipping disclaimer text, and full-width Primary Button (`"CHECKOUT — $1,480"`).

---

### Navigation Header (`app/(shop)/layout.tsx`)

- **Height**: Fixed `64px`.
- **Surface**: Flush `tokens.colors.surface`, bottom hairline divider `1px solid tokens.colors.outline`.
- **Distribution**:
  - Left: Serif wordmark `NORTHWATCH` with `accent` green pip.
  - Center: Horizontal link manifest (`Catalog`, `Archive`, `Manufacture`, `Journal`) in Grotesk `0.8125rem`, uppercase, `0.1em` tracking.
  - Right: Utilities: Search toggle, Account icon, and Cart Drawer trigger displaying bracketed tally (`BAG [0]`).

---

## 6. Responsive & Viewport Breakpoints

- **Desktop (`≥ 1024px`)**:
  - Catalog displays as a 3-column or 4-column architectural grid with hairline cell borders.
  - Product detail layout: 55% gallery sticky column, 45% specification and action column.
- **Tablet (`768px – 1023px`)**:
  - Catalog drops to a 2-column grid.
  - Main navigation links collapse into a slide-over panel.
- **Mobile (`< 768px`)**:
  - Catalog defaults to a 2-column grid. Single-column card stacking is prohibited on catalog pages to retain shop density.
  - Horizontal module lists (such as mechanical specifications or brand values) convert into a single-line horizontal scroll rail (`overflow-x-auto`, snap align start).
  - Checkout and Cart sticky CTAs dock flush to the bottom viewport with an underlying hairline border.
