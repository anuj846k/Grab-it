---
name: Give. Grab. Repeat.
colors:
  surface: '#f9f9ff'
  surface-dim: '#d3daef'
  surface-bright: '#f9f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f1f3ff'
  surface-container: '#e9edff'
  surface-container-high: '#e1e8fd'
  surface-container-highest: '#dce2f7'
  on-surface: '#141b2b'
  on-surface-variant: '#3c4a42'
  inverse-surface: '#293040'
  inverse-on-surface: '#edf0ff'
  outline: '#6c7a71'
  outline-variant: '#bbcabf'
  surface-tint: '#006c49'
  primary: '#006c49'
  on-primary: '#ffffff'
  primary-container: '#10b981'
  on-primary-container: '#00422b'
  inverse-primary: '#4edea3'
  secondary: '#5d5f5f'
  on-secondary: '#ffffff'
  secondary-container: '#dfe0e0'
  on-secondary-container: '#616363'
  tertiary: '#5c5f60'
  on-tertiary: '#ffffff'
  tertiary-container: '#a1a3a4'
  on-tertiary-container: '#37393b'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#6ffbbe'
  primary-fixed-dim: '#4edea3'
  on-primary-fixed: '#002113'
  on-primary-fixed-variant: '#005236'
  secondary-fixed: '#e2e2e2'
  secondary-fixed-dim: '#c6c6c7'
  on-secondary-fixed: '#1a1c1c'
  on-secondary-fixed-variant: '#454747'
  tertiary-fixed: '#e1e3e4'
  tertiary-fixed-dim: '#c5c7c8'
  on-tertiary-fixed: '#191c1d'
  on-tertiary-fixed-variant: '#454748'
  background: '#f9f9ff'
  on-background: '#141b2b'
  surface-variant: '#dce2f7'
typography:
  display-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 48px
    fontWeight: '700'
    lineHeight: '1.2'
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '700'
    lineHeight: '1.2'
  headline-lg-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '700'
    lineHeight: '1.2'
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.3'
  headline-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 20px
    fontWeight: '600'
    lineHeight: '1.4'
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.5'
  label-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '600'
    lineHeight: '1.2'
    letterSpacing: 0.01em
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: '1.2'
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 4px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  2xl: 48px
  3xl: 64px
  container-max: 1280px
  gutter: 20px
  margin-mobile: 16px
  margin-desktop: 32px
---

## Brand & Style

The brand personality is rooted in optimism, community altruism, and environmental consciousness. This design system facilitates a frictionless cycle of giving and receiving, prioritizing trust and warmth through its visual language.

The design style is **Modern / Social**, blending high-utility SaaS patterns with the approachable aesthetics of lifestyle platforms. It utilizes generous whitespace, soft depth, and organic shapes to lower the barrier to entry for new users, making the act of "giving away" feel rewarding and the act of "claiming" feel dignified and communal.

## Colors

The palette is lead by **Emerald Green**, symbolizing growth, sustainability, and the "go" signal of a successful claim.

- **Primary**: Used for the "North Star" actions (Post an Item, Claim).
- **Surface**: Pure White is the canvas, ensuring the high-quality photography of items remains the focal point.
- **Backgrounds**: Soft grays (Tertiary) are used to differentiate feed containers from the global background.
- **Typography**: Dark Gray ensures WCAG AAA compliance for readability, crucial for a community-driven marketplace accessible to all demographics.

## Typography

We use a dual-font strategy to balance personality with utility.

- **Plus Jakarta Sans** is used for headlines. Its soft, rounded terminals echo the friendly brand voice and complement the large border radii used in the UI.
- **Inter** is used for body text and labels. Its high x-height and neutral character ensure that item descriptions and logistics are highly legible across all devices.
- **Scale**: Use `display-lg` only for hero marketing sections. Item titles in the feed should use `headline-sm` to maintain a compact yet clear grid.

## Layout & Spacing

The layout follows a **Fluid Grid** model with a soft 4px baseline rhythm.

- **Desktop**: A 12-column grid with 20px gutters. Content is capped at a 1280px container to prevent excessive line lengths in item descriptions.
- **Mobile**: A 2-column grid for item feeds to allow for large, "Instagram-style" imagery while maintaining browsing efficiency. Margins are set to 16px.
- **Spacing Logic**: Use `lg` (24px) for padding within cards and `xl` (32px) for vertical section spacing. This generous airiness reinforces the "modern and clean" aesthetic.

## Elevation & Depth

This design system uses **Ambient Shadows** to create a sense of physical layering without feeling heavy.

- **Level 1 (Feed Cards)**: A very soft, diffused shadow (0px 4px 20px rgba(0,0,0,0.05)) that makes cards feel like they are resting lightly on the surface.
- **Level 2 (Modals/Popovers)**: A more pronounced shadow (0px 10px 30px rgba(0,0,0,0.1)) to draw focus.
- **Tonal Depth**: Use subtle background shifts (Secondary to Tertiary) to group content sections rather than relying solely on borders.
- **Interactions**: On hover, feed cards should lift slightly (translate -4px) and the shadow should increase in blur and spread to provide tactile feedback.

## Shapes

The shape language is defined by **High Roundedness**.

- **Containers & Cards**: Use a 16px (1rem) radius as the standard for all item cards and main containers.
- **Buttons**: Use 100px (Pill-shaped) for primary action buttons to make them feel friendly and "clickable."
- **Inputs**: Use an 8px or 12px radius to maintain consistency while appearing slightly more structured for data entry.
- **Avatars**: Always circular to emphasize the human, community element.

## Components

- **Item Cards**: Image-first. Aspect ratio should be 1:1 or 4:5. The title and distance tag should sit directly below the image with generous padding.
- **Primary Buttons**: Emerald Green background with White text. Use a subtle scale-down effect (0.98) on click for a "squishy," tactile feel.
- **Chips**: Used for categories (e.g., "Furniture," "Books"). These should have a light gray background and 100px border radius, switching to Primary Green when selected.
- **Input Fields**: Large, 12px padded fields with a 1px soft gray border. On focus, the border should transition to Emerald Green with a 3px soft outer glow.
- **Success States**: Use the Emerald Green palette for all confirmation toasts and "Grabbed!" animations to reinforce the positive cycle.
- **Empty States**: Use soft, illustrative icons and encouraging copy to prompt the user to "Give" or "Grab" their first item.F
