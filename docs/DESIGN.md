# Decompress V1 — Design System & Accessibility Specification

*Mobile-first, light theme, friendly and modern with generous spacing and large rounded corners (`rounded-2xl`).*

---

## 1. Core Brand Colour Tokens

Defined in `app/globals.css` under Tailwind CSS v4 `@theme` and used exclusively across components:

| Token | Name | Hex | Primary Use |
| :--- | :--- | :--- | :--- |
| `brand-navy` | Deep Navy (Primary) | `#123B60` | Brand identity, top header, headings, primary structural text, footer, Secondary Action button fill |
| `brand-teal` | Vibrant Teal (Secondary) | `#13A6A3` | Highlights, icons, category indicators, interactive borders, focus rings |
| `brand-coral` | Coral (Accent) | `#FF704F` | Primary booking buttons ("Explore Experiences", "Book Now", "Request Booking"), special offers, important actions |
| `brand-yellow` | Golden Yellow (Highlight) | `#FFC857` | Promotions, verified review star ratings, occasional highlights |
| `surface` | Soft White (Background) | `#F5F8FA` | Main page backgrounds and primary content sections |
| `surface-teal` | Light Teal (Secondary Surface) | `#E7F5F3` | Cards, subtle backgrounds, secondary sections, filter callouts |

---

## 2. Required Accessibility Corrections & Derived Shades (WCAG 2.1 AA)

### A. Coral Action Contrast & Hover/Active Shades
- **Contrast observation**: Pure white (`#FFFFFF`) on `brand-coral` (`#FF704F`) yields a contrast ratio of **2.73:1**, which does not meet WCAG AA for small text (4.5:1) and requires **large/bold text (≥ 18px semibold / 14pt bold, ≥ 3:1 target)** plus darker hover/pressed states.
- **Rules enforced**:
  1. Keep `#FF704F` (`brand-coral`) as the primary button fill to honour the brand palette, and enforce `text-lg` (`18px`) `font-semibold` white labels on all coral buttons.
  2. **Never** use `brand-coral` (`#FF704F`) as body-text colour on light backgrounds. When a warm accent text badge or alert is needed on light surfaces, use `brand-coral-text` (`#B8371A`, contrast **5.84:1** on `#F5F8FA`).
  3. Derived interactive states for coral buttons:
     - `brand-coral-hover`: `#E55A38` (hover state)
     - `brand-coral-active`: `#CC4A2B` (pressed/active state)

### B. Teal Text vs. Teal Decorative/Border Token
- **Contrast observation**: `brand-teal` (`#13A6A3`) on `surface` (`#F5F8FA`) yields **2.84:1**, which is below the 4.5:1 WCAG AA requirement for normal text.
- **Rules enforced**:
  1. Use `brand-teal` (`#13A6A3`) for icons, borders (including the `2px` border on the Alternative Action button), and decorative category indicators.
  2. Derived accessible text token `brand-teal-text`: **`#0B6E6C`** (contrast ratio **5.68:1** on `surface` `#F5F8FA` and **5.12:1** on `surface-teal` `#E7F5F3`).
  3. All teal text labels—including the **"Plan an Event"** outline button label, active text links, and category kickers—use `text-brand-teal-text` (`#0B6E6C`).

### C. Deep Navy Shades
- `brand-navy`: `#123B60` (contrast **10.45:1** on `surface` `#F5F8FA` and **11.45:1** with white text).
- `brand-navy-hover`: `#0D2C49` (for Secondary Action button hover state).
- `brand-navy-light`: `#1B4F7E` (for subtle borders and hover states inside the Deep Navy header and footer).

---

## 3. Button Hierarchy Specification

All primary/hero buttons are full-width on mobile (`w-full sm:w-auto`), use `rounded-2xl`, `font-semibold`, and include a clear keyboard focus ring (`focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-brand-teal focus-visible:ring-offset-2`).

1. **Primary Action (`variant="primary"`)**:
   - Fill: `bg-brand-coral hover:bg-brand-coral-hover active:bg-brand-coral-active`
   - Label: `text-white text-lg font-semibold` (≥ 18px)
   - Used for: **"Explore Experiences"**, **"Book Now"**, **"Request Booking"**
2. **Secondary Action (`variant="secondary"`)**:
   - Fill: `bg-brand-navy hover:bg-brand-navy-hover`
   - Label: `text-white text-lg font-semibold`
   - Used for: **"Explore Venues"**
3. **Alternative Action (`variant="alternative"`)**:
   - Fill: `bg-transparent hover:bg-surface-teal`
   - Border: `border-2 border-brand-teal`
   - Label: `text-brand-teal-text text-lg font-semibold`
   - Used for: **"Plan an Event"**

---

## 4. Typography & Layout Scale

- **Font Family**: `Plus Jakarta Sans` (loaded via `next/font/google`), clean modern geometric sans-serif with `tabular-nums` for prices, Budget Ranges, wallet balances, and invoice figures.
- **Headings**: Always in `text-brand-navy` (`#123B60`) on light surfaces, or `text-white` inside the Deep Navy hero/header/footer.
- **Type Scale**:
  - Hero Headline: `clamp(2.25rem, 4vw, 3.5rem)`, `font-bold`, `tracking-tight`, `text-wrap: balance`
  - Page / Section Title (H1/H2): `1.75rem`–`2.25rem` (`28px`–`36px`), `font-bold`
  - Card / Venue Heading (H3): `1.125rem`–`1.25rem` (`18px`–`20px`), `font-semibold`
  - Body Text: `1rem` (`16px`), line-height `1.6`
  - Metadata & Filter Labels: `0.875rem` (`14px`), clean unboxed metadata separated by `·`
