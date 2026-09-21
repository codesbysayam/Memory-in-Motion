# Scientific & Development Rules

### 1. Scientific Honesty Mandate
- **Explicit Toy Model Boundaries:** Always declare that our matrix memory model is a simplified pedagogical vehicle. It illuminates linear algebraic principles (superposition, crosstalk, decay), but is NOT an exact replica of Pathway's commercial Dragon Hatchling (BDH) architecture.
- **No Pseudo-Science:** Never claim that linear recurrence solves all hallucinations or achieves infinite context without loss. Bounded capacity always entails trade-offs governed by linear algebra.
- **Epistemic Labeling:** Maintain clear visual chips marking:
  - `TOY EXPERIMENT` vs. `PUBLISHED RESEARCH`
  - `PROVEN THEOREM` vs. `EMPIRICAL HEURISTIC`

---

### 2. Implementation Rules
- **No Mock Engine Data:** Never fabricate retrieval scores, cosines, or classification labels. Everything must evaluate through `createAssociativeMemory` or actual vector calculations.
- **Zero Secrets on Client:** No API keys, tokens, or private secrets may ever be committed or bundled into browser assets.
- **Deterministic Experiments:** Default experiment runs must use seeded keys (`CANONICAL_FACTS`) to guarantee reproducibility.
- **Single-Source Milestone Authority:** Progress milestones must always be checked and marked via `/src/utils/progressTracker.ts`.

---

### 3. Visual & UX Standards (Anti-Slop)
- **No Generic AI Slop:** Banned: purple-to-blue gradients, cyan text on pitch black, generic marketing slogans ("Supercharge your AI!"), and non-functional button stubs.
- **Typography Standards:**
  - Headings: Newsreader / Source Serif 4
  - Body & UI: DM Sans / Inter
  - Math & Code: JetBrains Mono
- **Accessible Contrast:** All text must meet WCAG AA (minimum 4.5:1 ratio for body text).
- **Responsive Layouts:** Seamless support across mobile viewports (360px+), tablets, laptops, and ultra-wide displays with container bounds (`max-w-[1400px]`).
