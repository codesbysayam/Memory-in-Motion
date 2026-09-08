# MEMORY IN MOTION
### An Interactive Mechanistic Laboratory for Understanding Recurrent Memory and the Dragon Hatchling (BDH) Architecture

*A Submission for DataForge 2026 – Pathway Track: "Explain the Frontier"*  
*Approved Concept:* **In-Context Learning with Recurrent Memory**

---

## 1. Central Falsifiable Claim

> **"A fixed-size recurrent state can carry task-relevant information forward without growing a token-by-token memory, but compressing information into that state creates interference and forgetting."**

Every computation, interactive control, differential matrix view, and failure curve in this laboratory is implemented to allow learners and reviewers to directly observe, test, and verify this mathematical trade-off through live, deterministic execution.

---

## 2. One-Page Concept Summary (Executive Brief)

### Problem & Design Pressure
Modern large language models achieve in-context learning by appending keys and values for every processed token into an expanding KV-cache. This design yields an unbounded spatial complexity of $O(T)$ with respect to context length $T$, creating severe memory bandwidth bottlenecks and hardware constraints during long-horizon processing and continuous streaming. The fundamental design pressure is clear: can a machine carry task-relevant historical information forward without preserving an uncompressed record of every token observed?

### The Recurrent Memory Mechanism
Recurrent memory architectures replace the growing token cache with a fixed-size internal state space $S_t \in \mathbb{R}^{D \times D}$. Rather than appending tokens to memory, incoming information updates the state iteratively via a transition operator:
$$S_{t+1} = \lambda S_t + \eta \, (v_t k_t^T)$$
where $\lambda \in [0, 1]$ controls memory retention, $\eta$ scales write strength, and $v_t k_t^T$ represents the associative outer-product binding of the key $k_t$ and value $v_t$. Memory retrieval operates through linear projection $r = S_t q$, followed by similarity scoring against candidate targets. This guarantees strict $O(1)$ memory consumption and constant per-step computational latency regardless of context duration.

### Fixed-Size State & The Compression/Interference Trade-off
Because the physical dimensionality $D$ of the state space is fixed, the number of mutually quasi-orthogonal vectors the space can accommodate is mathematically bounded by the Johnson-Lindenstrauss lemma and linear algebraic rank constraints. When multiple factual associations are compressed into the same state matrix, their outer-product contributions superimpose. As the number of stored facts exceeds the quasi-orthogonal capacity of $\mathbb{R}^D$, off-diagonal cross-talk accumulates, causing subspace collisions, eigenvalue drift, and catastrophic interference. When a subsequent query is executed, the retrieved representation becomes distorted, leading to retrieval failures.

### Comparison with Growing Token Context
In standard transformer KV-caches, retrieval accuracy across long prompts is protected because tokens are stored uncompressed; however, memory footprint grows linearly without bound ($O(T)$). Recurrent memory makes the opposite trade-off: it achieves strict $O(1)$ memory bounds at the cost of information compression. The system trades perfect verbatim historical recall for bounded operational efficiency.

### Connection to Dragon Hatchling (BDH)
The **Dragon Hatchling (BDH)** architecture, introduced by Pathway Research (arXiv:2509.26507), offers a brain-inspired resolution to this tension. BDH mathematically transforms transformer-style attention into recurrent synaptic fast weights ($\sigma$). Memory is not maintained in an external key-value table; instead, it lives directly within the connections between computational units (neurons). BDH combines this synaptic state with non-negative, highly sparse activations ($\sigma \ge 0$) and local multi-round relaxation dynamics. Crucially, **BDH is NOT a Mamba-style State Space Model (SSM)**: while SSMs discretize 1D continuous linear time-invariant differential equations along the sequence dimension, BDH operates as a discrete, scale-free graph of interacting computational units governed by synaptic plasticity and local recurrent reasoning rounds.

### Connection to BDH-CQ & Latent Reasoning
**BDH-CQ** (arXiv:2608.09888) extends this architecture to recurrent multi-step reasoning. In standard transformer models, multi-step problem solving requires emitting intermediate tokens (Chain of Thought), further exacerbating the KV-cache bottleneck. BDH-CQ conducts multi-round reasoning directly within its fixed-size latent state without generating textual scratchpads, preserving bounded spatial memory while executing complex multi-hop inferences.

### Advantages & Disadvantages
- **Advantages:** Strict $O(1)$ memory footprint; constant inference latency; zero VRAM cache growth; suitability for continuous streaming and embedded deployments.
- **Disadvantages:** Irreversible lossy compression; vulnerability to distractor interference; exponential state decay under aggressive retention discounting; inability to reliably reconstruct exact verbatim transcripts when capacity limits are breached.

### Evidence & Educational Boundaries
This laboratory demonstrates these mathematical principles via deterministic, client-side linear algebra. Learners observe exact matrix updates ($\Delta M$), Frobenius norms, mean and maximum cell shifts, and top-1 retrieval margins across controlled sweeps. While the educational toy faithfully replicates the mathematical mechanics of associative memory and synaptic updates, it is a simplified pedagogical model and does not claim to run production billion-parameter weights or replicate published benchmark evaluations.

---

## 3. Intended Learner & Prerequisites

- **Target Audience:** Machine learning engineers, computer science students, computational neuroscientists, and AI researchers investigating post-transformer memory architectures and in-context learning.
- **Prerequisites:** 
  - Linear algebra fundamentals: vectors, inner products, outer products, matrix-vector multiplication, cosine similarity.
  - Familiarity with the Transformer KV-cache and autoregressive inference.
- **Key Question Addressed:** *Can an AI model maintain working memory without storing every historical token indefinitely?*

---

## 4. Learning Objectives

Upon completing this interactive laboratory, learners will be able to:
1. **Differentiate Memory Complexities:** Contrast the unbounded spatial footprint of growing token contexts ($O(T)$) with fixed-size recurrent states ($O(1)$).
2. **Trace the Mechanistic Pipeline:** Step through the end-to-end flow: $\text{INPUT} \to \text{ENCODE} \to \text{WRITE} \to \text{MEMORY STATE} \to \text{QUERY} \to \text{READ} \to \text{RETRIEVE} \to \text{PREDICTION}$.
3. **Analyze Matrix Updates:** Inspect real cell-by-cell matrix differences ($\Delta M = M_{t+1} - M_t$) and evaluate mean/max $|\Delta M|$ statistics.
4. **Induce and Explain Memory Failure:** Systematically provoke associative interference by reducing dimensionality ($D=4$) or increasing distractor updates, measuring the collapse in Top-1 Margin.
5. **Distinguish BDH from SSMs:** Articulate why BDH is not a continuous 1D SSM (such as Mamba), but a discrete graph of non-negative sparse activations with synaptic fast-weight plasticity.
6. **Understand Recurrent Latent Reasoning (BDH-CQ):** Explain how recurrent internal relaxation cycles replace external autoregressive token generation for complex multi-hop queries.

---

## 5. System Architecture & Component Hierarchy

The application is structured as a client-side, browser-native research workspace built with React 18, TypeScript, and Tailwind CSS. It requires no external backend, API keys, or remote database connections.

```
src/
├── components/
│   ├── MemoryWriteRead.tsx           # 7-stage end-to-end mechanistic pipeline inspector
│   ├── MatrixDiff.tsx                # Cell-by-cell before/after/delta matrix difference view
│   ├── MemoryOverwriteExperiment.tsx # Sequential write collision experiment (Japan->Tokyo vs Osaka)
│   ├── ContextOrderExperiment.tsx    # Order-permutation ablation (Sequence A vs Sequence B)
│   ├── MemorySurgery.tsx             # Controlled counterfactual causal probe (omit single write)
│   ├── RepresentationInspector.tsx   # Latent representation vector inspector (min, max, L2 norm)
│   ├── StatePersistenceExperiment.tsx# Persistence vs intervening distractor decay curve
│   ├── CapacityExperiment.tsx        # Dimensionality vs accuracy capacity boundary sweep
│   ├── InterferenceMap.tsx           # 2D cross-talk interference heatmaps
│   ├── EvidenceLadder.tsx            # 4-level formal epistemic hierarchy drawer
│   ├── Section01Hero.tsx             # Break the Memory: interactive live toy preview
│   ├── Section02TransformerProblem.tsx# O(T) KV-cache explosion analysis
│   ├── Section03RecurrentMemory.tsx  # Core recurrent state mechanics & memory inspector
│   ├── Section04InterferenceLab.tsx  # Experimental suite: pipeline, collisions, decay, sweeps
│   ├── Section05FindTheFailure.tsx   # Interactive challenge: systematically break the memory
│   ├── Section06RecoveryStrategies.tsx# Capacity scaling, orthogonalization, and sparsity
│   ├── Section07BiologicalMemory.tsx # Neuroscience parallels: synaptic plasticity & working memory
│   ├── Section08BDHArchitecture.tsx  # BDH microscope, synaptic plasticity, sparsity inspector
│   ├── Section09BDHCQReasoning.tsx   # BDH-CQ recurrent latent reasoning vs Chain-of-Thought
│   ├── Section10FinalChallenge.tsx   # Synthesis challenge & parameter tuning sandbox
│   ├── Section11JudgeMode.tsx        # Comprehensive criteria evaluation dashboard
│   └── navigation/ResearchNav.tsx    # Accessible top navigation bar & index drawer
├── lib/
│   ├── associativeMemory.ts          # Deterministic linear algebra engine & PRNG substrate
│   └── math.ts                       # Frobenius norm, cosine similarity, vector arithmetic
```

---

## 6. Educational Recurrent-Memory Toy Methodology

### Mathematical Foundation
The educational simulation implements an associative vector-symbolic recurrent memory substrate:
1. **Deterministic Representation:** Each discrete symbol (country, capital) is mapped to a unit-norm vector in $\mathbb{R}^D$ using a seeded pseudo-random basis generator (`mulberry32`), ensuring 100% deterministic, reproducible latent representations.
2. **Associative Outer-Product Write:**
   $$M_{t+1} = \lambda M_t + \eta \, (v_t k_t^T)$$
   where $M \in \mathbb{R}^{D \times D}$, $\lambda \in [0.1, 1.0]$ is retention, and $\eta \in [0.1, 1.0]$ is write strength.
3. **Linear Readout:**
   $$r = M_t q$$
   where $q \in \mathbb{R}^D$ is the query vector and $r \in \mathbb{R}^D$ is the reconstructed value vector.
4. **Candidate Retrieval & Scoring:**
   The retrieved vector $r$ is scored against all vocabulary candidates $c_i \in \mathbb{R}^D$ via cosine similarity:
   $$\text{Retrieval Score}(c_i) = \frac{r \cdot c_i}{\|r\|_2 \|c_i\|_2}$$
5. **Top-1 Margin:**
   $$\text{Top-1 Margin} = \text{Score}_{(1)} - \text{Score}_{(2)}$$
   reflecting the separation between the top predicted candidate and the nearest competitor.

---

## 7. Model Contract & Epistemic Honesty

To maintain scientific integrity, all statements and visualizations in this project are explicitly labeled according to the following 4-level taxonomy:

| Level | Epistemic Label | Definition & Boundary |
| :---: | :--- | :--- |
| **Level 1** | `LIVE TOY COMPUTATION` | Calculated on-device in real time by the browser's JavaScript engine using deterministic linear algebra. |
| **Level 2** | `PUBLISHED RESEARCH` | Primary architectural derivations, equations, and specifications from published literature (Pathway Research / arXiv:2509.26507). |
| **Level 3** | `PUBLISHED BENCHMARK` | Empirical results reported in published papers on standardized benchmarks. |
| **Level 4** | `EDUCATIONAL INTERPRETATION` | Pedagogical schematics, conceptual frameworks, and simplified models designed to develop intuitive understanding. |

### Explicit Scientific Boundaries:
- **No Production Claims:** The educational recurrent memory toy is an illustrative pedagogical abstraction. It is **not** a trained multi-billion-parameter language model and does not run production checkpoints.
- **No Calibrated Probabilities:** Cosine similarities are strictly labeled as **Retrieval Scores**, accompanied by tooltips stating that scores measure geometric representation similarity, not calibrated statistical probabilities.
- **No Semantic Coordinates:** Individual matrix cells $M[i][j]$ and latent vector dimensions are described strictly as computational coordinate axes, not as human-interpretable semantic features.
- **No Fabricated Benchmarks:** Toy observations are never claimed to reproduce published empirical benchmark scores from Pathway Research.

---

## 8. Architectural Distinction: Why BDH is NOT an SSM

A central pedagogical requirement of the Pathway Track is clarifying the distinction between the Dragon Hatchling architecture and Mamba-style State Space Models:

| Feature | State Space Models (Mamba / S4 / S6) | Dragon Hatchling (BDH) |
| :--- | :--- | :--- |
| **Mathematical Basis** | Continuous 1D linear time-invariant ODEs: $h'(t) = A h(t) + B x(t)$ | Discrete particle interaction across a scale-free graph |
| **Discretization** | Zero-order hold or bilinear transform along the sequence dimension | Discrete multi-round internal synaptic relaxation |
| **Activation Space** | Unconstrained signed real numbers ($\mathbb{R}$) | Strictly **non-negative** activations ($\sigma \ge 0$) |
| **Sparsity** | Dense or weakly gated 1D hidden states | **High structural sparsity** (e.g., small fraction of active neurons per round) |
| **Memory Locus** | Latent 1D state vectors updated via input-dependent $B, C$ | **Synaptic matrix ($\sigma$)** acting as evolving fast weights |
| **Multi-Hop Reasoning** | Requires autoregressive token generation | **Recurrent internal latent passes** (BDH-CQ) |

---

## 9. Experiment Controls & Deterministic Configuration

The laboratory provides full interactive control over the mathematical parameters:

- **State Dimension ($D$):** Toggle between $D=4, 8, 16, 32$. Low dimensions induce immediate geometric interference; higher dimensions restore subspace separability.
- **Retention Rate ($\lambda$):** Continuous slider from $0.10$ to $1.00$. Controls how rapidly earlier matrix entries decay when new updates occur.
- **Write Strength ($\eta$):** Adjusts the magnitude of incoming outer-product updates.
- **Interference Ratio:** Scales the magnitude and frequency of intervening distractor facts.
- **Deterministic PRNG Seeds:** Presets for `seed=42`, `seed=77`, and `seed=12345` guarantee that reviewers on different machines reproduce identical matrix values and retrieval curves.

---

## 10. Known Limitations

1. **Pedagogical Scale:** The browser toy operates on small dimensions ($D \le 32$) and synthetic associative tuples. It is designed to illustrate mathematical principles of interference and capacity, not to perform real-world natural language translation.
2. **Linear Hebbian Formulation:** The toy's write rule uses a standard Hebbian outer-product update. While this captures the foundational principles of synaptic fast weights, the published BDH architecture employs a four-round loop involving memory reads, synaptic reweighting, non-negative neuron activations, and inhibitory/excitatory graphs.
3. **No Direct Benchmark Equivalence:** Observations made within the browser toy reflect the properties of this specific educational substrate and should not be generalized as universal empirical assertions about all recurrent architectures.

---

## 11. Reproducibility Guide for Reviewers

To reproduce key findings:
1. **Observe the Interference Failure:**
   - Navigate to **Section 04: Interference Laboratory**.
   - Select the **1. WHEN MEMORY COLLIDES** tab.
   - Set Dimension to $D=4$ and Retention to $0.90$.
   - Observe that writing 8 factual associations drives the Top-1 Margin below zero, resulting in incorrect retrievals due to subspace saturation.
2. **Inspect the Matrix Difference:**
   - Switch to the **0. WRITE / READ PIPELINE** tab.
   - Click **STEP THROUGH WRITE** to view the exact cell-by-cell matrix update ($\Delta M = M_{t+1} - M_t$).
   - Verify that the reported mean $|\Delta M|$ and max $|\Delta M|$ match the visual heatmaps.
3. **Test Context-Order Equivalence:**
   - Run the **Context Order Experiment** to test whether permuting the sequence of identical facts alters retrieval accuracy under the current retention parameter.
4. **Demonstrate Recovery via Dimension Scaling:**
   - Navigate to **Section 06: Recovery Strategies**.
   - Increase Dimension from $D=4$ to $D=32$. Observe how expanded orthogonal capacity restores the Top-1 Margin and eliminates retrieval errors.

---

## 12. Reproduction, Setup & Build Instructions

This project is built with standard Vite and React 18 in TypeScript.

```bash
# 1. Clone the repository
git clone <repository-url>
cd memory-in-motion

# 2. Install dependencies
npm install

# 3. Start the local development server (runs on port 3000)
npm run dev

# 4. Typecheck and lint
npm run lint

# 5. Build for production
npm run build
```

---

## 13. Disclosures & Credits

### AI Assistance Disclosure
> *"This project was developed with AI assistance (Google AI Studio / DeepMind Gemini). The author is entirely responsible for understanding, verifying, mathematically auditing, and defending every component, equation, and claim in this submission."*

### Code, Data & Asset Disclosures
- **Codebase:** 100% custom-written TypeScript and React code. No proprietary or closed-source libraries.
- **Icons:** Lucide React icons.
- **Styling:** Tailwind CSS with custom high-contrast dark palette.
- **Dataset:** Deterministic synthetic entity-relationship associative tuples (e.g., countries, capitals, elements) generated on-device via PRNG.
- **License:** Apache License 2.0.

---

## 14. Primary Research References

1. **The Dragon Hatchling (BDH) Architecture:**  
   *Pathway Research Team*, arXiv:2509.26507  
   [https://arxiv.org/abs/2509.26507](https://arxiv.org/abs/2509.26507)
2. **Official BDH GitHub Repository:**  
   *Pathway Research*, `pathwaycom/bdh`  
   [https://github.com/pathwaycom/bdh](https://github.com/pathwaycom/bdh)
3. **BDH-CQ: In-Context Recurrent Latent Reasoning:**  
   *Pathway Research Team*, arXiv:2608.09888  
   [https://arxiv.org/abs/2608.09888](https://arxiv.org/abs/2608.09888)
4. **Pathway Research Portal:**  
   [https://pathway.com/research/](https://pathway.com/research/)
5. **The Equations of Reasoning:**  
   *Pathway Research Explainer*  
   [https://pathway.com/research/the-equations-of-reasoning](https://pathway.com/research/the-equations-of-reasoning)
6. **NeurIPS Educational Resource Guidelines:**  
   [https://neurips.cc/Conferences/2026/CallforEducationalResources](https://neurips.cc/Conferences/2026/CallforEducationalResources)
