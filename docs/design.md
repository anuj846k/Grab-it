# Design System Strategy: The Digital Sommelier

## 1. Overview & Creative North Star

The North Star for this design system is **"The Digital Sommelier."** This is an Android-first experience designed to feel like an exclusive, dimly lit boutique—warm, curated, and highly intentional. We are moving away from the "flat utility" of standard apps toward a high-end editorial feel.

To achieve this, the system breaks the standard "Material" mold by using **intentional asymmetry** and **tonal depth**. We don't just place items on a grid; we "hang" them in a space. By utilizing high-contrast typography (Manrope for impact, Inter for utility) and a "Dark Mode Only" philosophy, we create a focused, premium atmosphere where the content—and the signature Cherry Red—are the only stars.

---

## 2. Colors & Tonal Depth

The palette is built on a foundation of "Deep Warm Charcoal" to avoid the clinical feel of pure black.

### Surface Hierarchy & Nesting

We do not use lines to define space. We use **Nesting**.

- **The "No-Line" Rule:** 1px solid borders for sectioning are strictly prohibited. Boundaries are defined by shifting from `surface-container-low` to `surface-container-high`.
- **The Layering Principle:** Treat the UI as physical layers of fine paper.
  - **Base Layer:** `background` (#0C0A0B).
  - **Content Blocks:** `surface` (#161314).
  - **Interaction/Nested Cards:** `surface-container-highest` (#383435).
- **The "Glass & Gradient" Rule:** Floating elements (like Bottom Sheets or Navigation Bars) should utilize **Glassmorphism**. Apply `surface` with 80% opacity and a 20px backdrop-blur.
- **Signature Textures:** For main CTAs, use a subtle linear gradient from `primary` (#ffb3b6) to `primary_container` (#e11d48) at a 135-degree angle to provide "soul" and depth.

---

## 3. Typography

We use a dual-sans-serif approach to balance boutique character with extreme readability.

| Category     | Typeface | Token         | Usage                                            |
| :----------- | :------- | :------------ | :----------------------------------------------- |
| **Display**  | Manrope  | `display-lg`  | Hero editorial moments. High tracking (-2%).     |
| **Headline** | Manrope  | `headline-md` | Section headers. Bold, authoritative.            |
| **Title**    | Inter    | `title-lg`    | Card titles. High contrast against `on-surface`. |
| **Body**     | Inter    | `body-md`     | Standard reading. Elevated line-height (1.6).    |
| **Label**    | Inter    | `label-sm`    | Metadata. Uppercase with +5% letter spacing.     |

**Editorial Intent:** Use `display-lg` sparingly. Overlap text onto image containers slightly to break the "boxed" feel of traditional Android layouts.

---

## 4. Elevation & Depth

In this system, elevation is a feeling, not a drop-shadow.

- **Ambient Shadows:** Standard Material shadows are too "heavy." Use "Ambient Glows" instead. If an element must float, use a shadow with a blur of 32dp, 0dp offset, and a color derived from `surface_tint` at 4% opacity.
- **The "Ghost Border" Fallback:** If accessibility requires a stroke (e.g., in high-glare environments), use the `outline_variant` (#5c3f40) at **15% opacity**. It should be felt, not seen.
- **Tonal Layering:** To highlight a "Picked" item, do not increase its size. Instead, shift its background from `surface-container` to `surface-bright`.

---

## 5. Components

### Buttons

- **Primary:** Gradient fill (`primary` to `primary_container`). 16dp radius (`lg`). No border. White text (`on_primary_container`).
- **Secondary:** Surface-only. `surface-container-high` background with a `Ghost Border`.
- **Tertiary:** Text-only in `primary` color. 0dp padding on sides to align with text grids.

### Cards & Lists

- **The Rule of Silence:** Forbid divider lines. Separate list items using `12dp` of vertical whitespace or a subtle toggle between `surface-container-low` and `surface-container-lowest`.
- **Radius:** All cards must use the `xl` (1.5rem / 24dp) radius for a modern, friendly feel, while nested elements use the `md` (0.75rem / 12dp) radius.

### Input Fields

- **State:** Instead of a border-bottom, use a filled `surface-container-high` with a 16dp top-radius. On focus, the `primary` color should appear as a 2dp "glow" at the base, not a harsh line.

### Signature Component: The "Cherry Slide"

A bespoke horizontal scroll component where the first item is 20% larger than the others, creating an intentional asymmetric focal point that signals "Curated Choice."

---

## 6. Do's and Don'ts

### Do

- **Do** use negative space aggressively. If it feels "empty," it’s likely premium.
- **Do** use the `tertiary` (#74d8bd) color for success states or "Verified" badges to provide a cool contrast to the warm charcoal.
- **Do** ensure all touch targets are at least 48dp, even if the visual element is smaller.

### Don't

- **Don't** use pure #000000. It kills the "Warm Boutique" vibe.
- **Don't** use 100% opaque borders. They create "visual noise" that interferes with the editorial flow.
- **Don't** use standard Android "Ripple" effects in bright white. Use a `surface-highlight` ripple to keep the interaction subtle.
