# Product Requirements Document (PRD)

## Product: Memory in Motion
**Interactive Laboratory for Recurrent Memory and the Dragon Hatchling Architecture**

### 1. Executive Summary
*Memory in Motion* is an interactive, browser-based computational research laboratory designed to teach the mechanics of recurrent working memory, associative state matrices, capacity bounds, and synaptic network architectures (such as Pathway's Dragon Hatchling / BDH). The application replaces passive text explanations with live linear algebraic simulation, counterfactual interventions, and empirical evaluations.

---

### 2. Target Audience & Personas
- **AI Researchers & Engineers:** Seeking intuition for alternatives to unbounded Transformer KV-caches and non-token latent reasoning.
- **Machine Learning Students:** Learning Hebbian plasticity, rank-1 outer-product updates, and subspace interference in high dimensions.
- **Scientific Evaluators & Judges:** Looking for verified empirical evidence, reproducible calculations, and rigorous epistemic separation between toy demonstrations and cutting-edge research.

---

### 3. Core Pedagogical Journey (7 Stages)
1. **Stage 01: Memory (Where Memory Lives)**
   - The fundamental trade-off: Unbounded KV-cache token tapes vs. fixed-size continuous recurrent states.
   - Live associative fast-weight memory instrument ($M_{t+1} = \lambda M_t + \eta k_t v_t^\top$).
2. **Stage 02: Break (Inducing Failure)**
   - Stress-testing state capacity.
   - Ingesting sequential facts and distractor perturbations to witness geometric coordinate collisions.
3. **Stage 03: Trace (Inspecting Coordinates)**
   - State coordinate difference inspection ($\Delta M$).
   - Counterfactual Memory Surgery: selectively erasing or injecting vector directions to see causal impact on retrieval.
4. **Stage 04: Measure (Quantitative Evidence)**
   - Capacity scaling bounds ($C \approx \mathcal{O}(d)$).
   - Empirical sweep across dimensions ($D=4, 8, 16, 32, 64$) plotting cosine margin and Frobenius norm drift.
5. **Stage 05: BDH (Synaptic Architecture)**
   - Moving from a single dense matrix to Pathway's Dragon Hatchling (BDH) architecture.
   - Biological Hebbian plasticity, scale-free synaptic networks, and sparse connection topologies.
6. **Stage 06: Reason (Latent Dynamics)**
   - Continuous latent thinking loops (BDH-CQ) before token generation.
   - Interactive particle relaxation physics simulation.
7. **Stage 07: Prove (Evaluation & Capstone)**
   - 60-Second Fast Verification interactive assessment.
   - Diagnostic prediction challenges.
   - Verifiable Certificate of Completion with automatic confetti celebration and PDF export.

---

### 4. 60-Second Fast Verification Assessment Requirements
- **Real Continuous Timer:** Driven by `performance.now()` and `requestAnimationFrame`. Does not tick until user explicitly starts the test. Hard 60-second limit with timeout handling.
- **5 Evaluation Stages (20 points each, 100 max):**
  1. *Remember:* High-fidelity retrieval check in clean state ($D=16$).
  2. *Break:* Distractor injection and interference verification.
  3. *Trace:* Algebraic coordinate delta identification.
  4. *Measure:* Quantitative hypothesis test on dimension scaling.
  5. *BDH Synthesis:* Architectural differentiation between dense toy state and scale-free synaptic graphs.
- **No Hardcoded Values:** All retrieval scores, cosine margins, and predictions are computed directly by `createAssociativeMemory` from `/src/models/associativeMemory.ts`.
- **State Persistence:** Attempts are recorded in `localStorage` under `memory_test_attempts` with full timestamped logs.

---

### 5. Scientific Honesty Guidelines
- Explicitly label toy models as educational pedagogical approximations.
- Clearly separate what the student verified experimentally from published properties of Dragon Hatchling (BDH).
- Do not claim a toy matrix "reproduces" BDH or proves AGI; maintain epistemic humility and formal mathematical rigor.
