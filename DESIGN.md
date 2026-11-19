# MEMORY IN MOTION — KINETIC EDITORIAL DESIGN SYSTEM

## Design thesis
Memory in Motion is an interactive scientific essay, not a SaaS dashboard. The visual
system must make recurrent memory, interference, state updates, empirical measurement,
BDH architecture and final verification understandable through purposeful visual
storytelling.

## Art direction
- Editorial, tactile, high-contrast, research-led.
- Warm paper canvas in light mode; deep ink canvas in dark mode.
- Instrument Serif for expressive display headlines.
- Manrope for body copy and controls.
- IBM Plex Mono for equations, labels, state values and captions.
- Signal blue for active focus; teal/coral/amber only for meaningful semantic states.
- Large typographic scale, spacious chapter openings, restrained rules and large figures.
- Avoid repeated card grids, glassmorphism, generic AI imagery and dashboard chrome.

## Motion principles
1. Motion must explain hierarchy, state change, continuity or cause and effect.
2. Native scrolling must remain native. Never hijack scroll position.
3. Chapter transitions: 500–700ms, subtle opacity/position/blur.
4. Reveal transitions: 700–900ms, once per element.
5. UI feedback: 150–220ms.
6. Diagram drawing: 900–1600ms when it explains sequence.
7. Respect prefers-reduced-motion and provide static equivalents.
8. No constant bouncing, flashing, random particle storms or motion for its own sake.

## Colour tokens
Light:
- Paper #F6F3EC
- Bright paper #FFFDF8
- Ink #17191D
- Secondary ink #41464D
- Muted #747A82
- Rule #D8D3C8
- Signal #3658D4
- Teal #3F8379
- Coral #C66A55
- Amber #9A681C

Dark:
- Paper #111419
- Surface #191E25
- Inset #202731
- Ink #F3F0E8
- Secondary #C8CBD0
- Muted #969DA7
- Rule #303843
- Signal #91A9FF

## Layout
- Wide figure canvas up to 1280px.
- Reading column approximately 680–740px.
- Desktop: sticky visual storytelling only when it clarifies a multi-step mechanism.
- Tablet: recompose split layouts; never compress a diagram beside a narrow paragraph.
- Mobile: stack story steps, make diagrams touch-readable, and provide manual next/previous controls.

## Chapter storytelling
Memory: define fixed-size state versus expanding KV cache.
Break: reveal interference and failure conditions using actual experiment controls.
Trace: expose real state updates and counterfactual trace steps.
Measure: prioritise actual evidence, methods, labels and uncertainty.
BDH: explain the actual repository architecture and data flow.
Reason: synthesise what BDH-CQ can and cannot establish.
Prove: focused 60-second verification, theory check, feedback and certificate.

## Scientific integrity
- Do not fabricate data, benchmark scores, model outputs, equations or claims.
- Mark toy examples as toy examples.
- Distinguish conceptual animations from live model computations.
- Preserve the existing experiment engines, BDH/BDH-CQ logic, routes, progress tracking,
  timer, assessment, scoring and certificate workflow.
- Keep chart labels, units, provenance and accessible text alternatives.

## Acceptance criteria
- Every chapter has a distinct visual rhythm.
- Navigation and contents do not overlap page content.
- Motion is smooth and never blocks reading.
- All interactive controls work by keyboard and touch.
- Light and dark themes both pass contrast checks.
- Mobile widths 360, 390, 430, 768 and 1024px are checked.
- Production build, TypeScript check, lint and route tests pass.
