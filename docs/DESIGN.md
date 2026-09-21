# Design System Specification

## 1. Editorial Scientific Identity
*Memory in Motion* evokes the physical authority and clarity of an academic preprint or journal (such as *Nature* or *Physical Review Letters*) paired with the interactive responsiveness of modern computational notebooks (Distill.pub / Observable).

---

## 2. Color Palette
- **Paper & Background:**
  - Base Body: `#FBF9F5` (Calm, warm off-white neutral)
  - Surface Cards: `#FFFFFF` (Pristine clean white)
  - Subtle Insets: `#FAF8F3` / `#F5F2EA`
  - Dividers & Borders: `#E5E0D8` / `#DCD9CF`
- **Typographic Neutral:**
  - Primary Text: `#1C1B19` (High-contrast charcoal ink)
  - Secondary Text: `#55524B` (Refined reading grey)
  - Tertiary / Captions: `#7C786E` (Subdued notation)
- **Scientific Accent Colors:**
  - Academic Navy: `#1B4D7E` (Interactive links, active selections, primary CTAs)
  - Empirical Green: `#1E6B43` (Verified truth, positive fidelity, ground truth)
  - Warning / Collision Amber: `#9E6712` (Coordinate crosstalk, capacity thresholds)
  - Error / Interference Rose: `#9A2222` (Memory loss, misclassification, collisions)

---

## 3. Typographic Scale
- **Headings (Newsreader / Source Serif 4):**
  - Hero Title: `text-4xl sm:text-6xl`, tracking tight, leading `1.1`
  - Section Headings: `text-2xl sm:text-3xl`, font-serif, bold
  - Subsection Labels: `text-lg sm:text-xl`, font-serif, semibold
- **Body & Controls (DM Sans / Inter):**
  - Body Text: `text-sm sm:text-base`, leading `1.6`, constrained line widths (`max-w-2xl` to `max-w-3xl`)
  - Control Labels: `text-xs font-semibold`, single-line nowrap
- **Technical Notation (JetBrains Mono):**
  - Equations, matrix dimensions, coordinates, scores: `font-mono text-xs / text-[11px]`

---

## 4. Spacing & Container Geometry
- **Outer Container Math:** Container outer padding ($\ge 16\text{px}$) always equals or exceeds internal element gaps.
- **Corner Radii:**
  - Outer cards: `rounded-2xl` ($16\text{px}$)
  - Inner widgets/tables: `rounded-xl` ($12\text{px}$)
  - Buttons and inputs: `rounded-lg` or `rounded-xl` ($8\text{px}-12\text{px}$)
  - Pills and badges: `rounded-full`
- **Dividers:** Clean $1\text{px}$ hairpins (`border-[#E5E0D8]`), avoiding dual heavy borders and blurry shadows.
