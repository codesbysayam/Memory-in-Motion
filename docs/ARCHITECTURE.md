# System Architecture & Technical Specifications

## 1. Overview
*Memory in Motion* is built as a deterministic, client-side, zero-latency computational laboratory in React 19, TypeScript 5.8, and Vite 6. All mathematical simulations run in-memory within the browser engine without backend latency.

```
[ Client Browser ]
  │
  ├── App.tsx (Root Router, Global State, Milestone Listeners)
  │     ├── Navigation (ResearchNav with TOC & Breadcrumb state)
  │     ├── Stages 01-07 (Modular educational views)
  │     ├── 60s Fast Verification (SixtySecondAssessment / JudgeMode)
  │     └── Modals (CertificateModal with canvas-confetti, GlossaryDrawer)
  │
  ├── Mathematical Core Engine (/src/models/associativeMemory.ts)
  │     ├── Deterministic hashing (pseudo-random unit vectors on S^{d-1})
  │     ├── Linear algebra: dot, norm, cosine, outerProduct
  │     ├── AssociativeMemory class: writeFact(), query(), removeFact()
  │     └── Frobenius norm drift and subspace interference calculations
  │
  ├── State & Progress Management (/src/utils/progressTracker.ts)
  │     ├── 8 Laboratory Milestones
  │     ├── SixtySecondTestAttempt storage (localStorage)
  │     └── Certificate verification & jsPDF vector rendering
  │
  └── LaTeX & Mathematical Typography
        ├── KaTeX 0.16 (InlineMath, BlockMath)
        └── Newsreader + DM Sans + JetBrains Mono typography stack
```

---

## 2. Mathematical Simulation Engine
Located in `/src/models/associativeMemory.ts`:
- **Vector Projection:** Keys and values are hashed into deterministic unit vectors in $\mathbb{R}^d$.
- **Fast-Weight Recurrence:**
  $$M_{t+1} = \lambda M_t + \eta k_t v_t^\top$$
  where $\lambda \in [0, 1]$ represents retention decay and $\eta > 0$ represents write strength.
- **Associative Readout:**
  $$\hat{v} = M q$$
  Predictions are resolved via maximum cosine similarity across known vocabulary candidates:
  $$\hat{y} = \arg\max_{c \in \mathcal{V}} \cos(\hat{v}, v_c)$$
- **Coordinate Drift:**
  $$\|M_{t+1} - M_t\|_F = \sqrt{\sum_{i=1}^d \sum_{j=1}^d (\Delta M_{ij})^2}$$

---

## 3. Component Hierarchy & Flow
- **`App.tsx`:** Primary lifecycle coordinator. Listens to custom window events (`milestone_updated`, `final_challenge_completed`, `open_certificate_modal`).
- **`SixtySecondAssessment.tsx`:** Self-contained, stateful 60-second test component. Operates both in modal view (via `JudgeMode.tsx`) and embedded in-page (via `SixtySecondTest.tsx`).
- **`LandingDemo.tsx`:** Live scientific instrument featuring real-time playback, parameter manipulation sliders, matrix heatmaps, and coordinate inspection.
- **`CertificateModal.tsx` & `CertificateDocument.tsx`:** Dynamic milestone verification, automated confetti explosion on capstone completion, and standalone PDF generator using `jspdf`.

---

## 4. Performance & Memory Safeguards
- Zero heavy server dependencies.
- Lightweight KaTeX math rendering without layout shift.
- Real-time `requestAnimationFrame` loop strictly cleaned up on unmount or completion.
- LocalStorage keys prefixed with `memory_` to avoid namespace collisions.
