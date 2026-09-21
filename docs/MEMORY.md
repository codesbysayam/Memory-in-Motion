# Mechanistic Deep Dive: Memory in Motion

## 1. The Geometric Nature of Recurrent Memory
Standard autoregressive Large Language Models rely on an unbounded Key-Value (KV) cache. For sequence length $T$ and hidden dimension $d$, memory usage scales as $\mathcal{O}(T \cdot d)$ per layer. In contrast, fixed-size recurrent systems compress sequential information into a state of constant dimension:
$$M_t \in \mathbb{R}^{d \times d} \quad \text{or} \quad h_t \in \mathbb{R}^d$$

### The Storage Law: Hebbian Superposition
To store an association between key $k_t \in \mathbb{R}^d$ and value $v_t \in \mathbb{R}^d$, the state is updated via the rank-1 outer product:
$$M_t = \lambda M_{t-1} + \eta \, k_t v_t^\top$$
where:
- $\lambda \in [0, 1]$ represents the retention / exponential decay factor.
- $\eta > 0$ represents the learning rate / write strength.

---

## 2. Readout & Subspace Interference
When querying the memory with a probe vector $q \in \mathbb{R}^d$:
$$\hat{v} = M_t q = \sum_{i=1}^t \lambda^{t-i} \eta (k_i^\top q) v_i$$
Separating the target fact from distractor facts:
$$\hat{v} = \underbrace{\lambda^{t-\text{target}} \eta (k_{\text{target}}^\top q) v_{\text{target}}}_{\text{Signal}} + \underbrace{\sum_{i \neq \text{target}} \lambda^{t-i} \eta (k_i^\top q) v_i}_{\text{Crosstalk Noise}}$$

### The Capacity Threshold
In finite dimensions $d$, two random unit vectors are never strictly orthogonal; their expected inner product magnitude is:
$$\mathbb{E}[|u^\top v|] \approx \sqrt{\frac{2}{\pi d}}$$
As sequence length $T$ grows beyond capacity bound $C \approx \mathcal{O}(d)$, the accumulated crosstalk noise variance exceeds the signal margin, leading to catastrophic interference and retrieval collapse.

---

## 3. How Pathway's Dragon Hatchling (BDH) Evolves This
Pathway's Dragon Hatchling (BDH) transcends dense toy matrix limits through three key architectural principles:
1. **Dynamic Synaptic Weights on Scale-Free Graphs:** Memory does not reside in a single dense block; it is distributed across sparse synaptic connections $\sigma(i, j)$ forming scale-free topologies.
2. **Sparse Biological Plasticity:** Updating only active cliques protects unaffected subgraphs from interference, preserving earlier facts while assimilating new context.
3. **Latent Recurrent Relaxation (BDH-CQ):** Instead of generating tokens strictly one-by-one in a single forward pass, the model performs iterative synaptic relaxation loops in continuous state space, allowing dynamic test-time computation before token emission.
