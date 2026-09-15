export type GlossaryCategory =
  | 'Foundations'
  | 'Mathematical Tools'
  | 'Plasticity & Learning'
  | 'Architectures & Models'
  | 'Failure Modes';

export interface GlossaryTerm {
  id: string;
  term: string;
  aliases: string[];
  category: GlossaryCategory;
  shortDefinition: string;
  formula?: string;
  formulaExplanation?: string;
  deepDive: string;
  intuition: string;
  empiricalRole: string;
  relatedTerms: string[];
  targetPage?: 'memory' | 'break' | 'trace' | 'measure' | 'bdh' | 'reason' | 'prove';
  targetSectionId?: string;
}

export const GLOSSARY_CATEGORIES: GlossaryCategory[] = [
  'Foundations',
  'Mathematical Tools',
  'Plasticity & Learning',
  'Architectures & Models',
  'Failure Modes',
];

export const GLOSSARY_TERMS: Record<string, GlossaryTerm> = {
  'recurrent-state': {
    id: 'recurrent-state',
    term: 'Recurrent State',
    aliases: ['recurrent memory', 'hidden state', 'state vector', 'compressed context', 'S_t', 'M_t'],
    category: 'Foundations',
    shortDefinition:
      'A fixed-capacity internal representation that continuously compresses sequential history into static dimensionality without buffering raw past tokens.',
    formula: 's_t = f(s_{t-1}, x_t) \\quad \\text{or} \\quad M_t = \\lambda M_{t-1} + \\eta k_t v_t^\\top',
    formulaExplanation:
      's_t is the state vector at step t, updated by transition function f using the previous state s_{t-1} and new input x_t. In matrix form, M_t retains prior memory scaled by retention λ and incorporates new associative outer products scaled by write strength η.',
    deepDive:
      'Unlike standard Transformer architectures that preserve an ever-growing linear log of past tokens in high-bandwidth memory (the KV-cache), a recurrent system summarizes temporal information into a state vector or weight matrix of fixed mathematical rank. The primary engineering trade-off is O(1) constant inference footprint versus lossy compression and capacity limits.',
    intuition:
      'Think of a physical chalkboard with finite square footage: rather than attaching new chalkboards indefinitely as the lecture proceeds (KV-cache), a recurrent state writes new notes directly over the existing surface. Old writing gently fades unless actively refreshed, and if too many facts are crammed in without cleaning, characters begin to overlap.',
    empiricalRole:
      'In our interactive laboratory, the recurrent state is instantiated as the d×d fast-weight matrix M and coordinate state vector s. You observe this vector directly in the real-time heatmap, watching its Frobenius norm grow and decay as new country-capital facts are stepped into memory.',
    relatedTerms: ['hebbian-plasticity', 'frobenius-norm', 'outer-product-update', 'kv-cache', 'capacity-interference'],
    targetPage: 'memory',
    targetSectionId: 'section-03',
  },

  'hebbian-plasticity': {
    id: 'hebbian-plasticity',
    term: 'Hebbian Plasticity',
    aliases: ['Hebbian learning', 'associative plasticity', 'local synaptic rule', 'cells that fire together', 'plastic weights'],
    category: 'Plasticity & Learning',
    shortDefinition:
      'A local neuro-computational learning principle where synaptic connection weights strengthen proportionally to the simultaneous correlated co-activation of connected units.',
    formula: '\\Delta W_{ij} = \\eta \\cdot x_i \\cdot y_j \\iff \\Delta W = \\eta (x \\otimes y) = \\eta x y^\\top',
    formulaExplanation:
      'W_{ij} represents the synaptic weight connecting neuron j to neuron i. When presynaptic unit j (activity y_j) and postsynaptic unit i (activity x_i) fire simultaneously, the connection strengthens by ΔW_{ij} scaled by write rate η.',
    deepDive:
      'Postulated by Canadian psychologist Donald O. Hebb in 1949 ("Neurons that fire together, wire together"), Hebbian plasticity serves as the foundational mechanism for biological memory formation and associative memory networks. In contemporary machine learning, local Hebbian rules enable "fast-weight" memory systems and models like BDH to assimilate novel facts on the fly during inference, entirely bypassing computationally expensive backpropagation through time (BPTT).',
    intuition:
      'Imagine paving a walking path through grass: every time people walk between two locations simultaneously, the grass is trampled down and the path becomes more defined. The path forms automatically through usage without a central architect needing to reconstruct the whole campus map from scratch.',
    empiricalRole:
      'Every time you click "Step" or "Add Distractor" in the lab, a rank-1 outer product matrix (k ⊗ v) is computed and added to M. The matrix entries strengthen at coordinates where key vector features and value vector features coincide, directly demonstrating local Hebbian binding.',
    relatedTerms: ['recurrent-state', 'outer-product-update', 'bdh-architecture', 'write-strength'],
    targetPage: 'bdh',
    targetSectionId: 'section-08',
  },

  'frobenius-norm': {
    id: 'frobenius-norm',
    term: 'Frobenius Norm',
    aliases: ['matrix norm', 'Euclidean matrix length', '||M||_F', 'matrix energy', 'Frobenius magnitude'],
    category: 'Mathematical Tools',
    shortDefinition:
      'The Euclidean length of a matrix treated as a flat vector, measuring the total accumulated energy, magnitude, and saturation level of stored memories.',
    formula: '\\|M\\|_F = \\sqrt{\\sum_{i=1}^d \\sum_{j=1}^d M_{ij}^2} = \\sqrt{\\operatorname{Tr}(M^\\top M)}',
    formulaExplanation:
      'Square each scalar component M_{ij} across all d rows and d columns, sum them together, and calculate the square root. Equivalently, it equals the square root of the trace of M^T M or the square root of the sum of squared singular values.',
    deepDive:
      'The Frobenius norm ||M||_F acts as an invariant scalar meter of associative density. Because individual matrix entries can fluctuate between positive and negative values as orthogonal patterns cancel or reinforce, the Frobenius norm captures total aggregate magnitude. Tracking ||M||_F over time reveals whether a recurrent network is asymptotically stabilizing (λ < 1.0), dying out (λ ≈ 0), or experiencing numerical explosion (λ ≥ 1.0).',
    intuition:
      'Picture an acoustic auditorium: even if different musical notes and voices produce crests and troughs that partially cancel each other out in the air, the overall volume meter (decibel level) measures the total sonic energy in the room. The Frobenius norm is the decibel meter for your memory matrix.',
    empiricalRole:
      'In our Live Debug Panel and Section 04/Measure instrumentation, ||M||_F is updated at every microstep. You can verify that setting retention λ=0.95 establishes a finite steady-state norm ceiling, whereas disabling decay allows the norm to escalate linearly without bound.',
    relatedTerms: ['recurrent-state', 'retention-coefficient', 'top-1-margin', 'capacity-interference'],
    targetPage: 'measure',
    targetSectionId: 'section-measure',
  },

  'outer-product-update': {
    id: 'outer-product-update',
    term: 'Outer Product Update',
    aliases: ['tensor outer product', 'key-value bind', 'k ⊗ v', 'rank-one update', 'matrix write'],
    category: 'Mathematical Tools',
    shortDefinition:
      'A rank-one matrix operation that binds a key vector k to a value vector v, yielding a d×d association matrix where probing with k projects out v.',
    formula: 'M_{t} = \\lambda M_{t-1} + \\eta \\cdot (k_t \\otimes v_t) = \\lambda M_{t-1} + \\eta \\cdot k_t v_t^\\top',
    formulaExplanation:
      'Vector k_t is a d×1 column vector and v_t^T is a 1×d row vector. Multiplying them produces a d×d matrix whose (i, j) element is k_i · v_j, encoding the bidirectional correlation between the two concepts.',
    deepDive:
      'The outer product is the mathematical bedrock of correlation associative memories (Hopfield networks, Kohonen maps, and modern fast-weight programmers). If key vectors are orthonormal (k_i^T k_j = δ_{ij}), querying the accumulated matrix with query vector q = k_1 yields: q^T M = k_1^T (k_1 v_1^T + k_2 v_2^T) = (1) v_1^T + (0) v_2^T = v_1^T, achieving error-free retrieval without explicit search.',
    intuition:
      'Think of coordinate grid coordinates: the key is latitude and the value is longitude. Taking their outer product drops a marker pin onto a 2D map table at their intersection, permanently tying the two coordinates together.',
    empiricalRole:
      'Whenever a fact like "Japan -> Tokyo" is written in the laboratory, the engine creates key vector k_{Japan} and value vector v_{Tokyo}, evaluates their outer product, and blends it into M.',
    relatedTerms: ['hebbian-plasticity', 'recurrent-state', 'orthogonal-projections', 'capacity-interference'],
    targetPage: 'memory',
    targetSectionId: 'section-03',
  },

  'capacity-interference': {
    id: 'capacity-interference',
    term: 'Capacity Interference',
    aliases: ['cross-talk', 'superposition noise', 'catastrophic interference', 'hash collision', 'vector leakage'],
    category: 'Failure Modes',
    shortDefinition:
      'The systematic readout distortion that occurs when multiple non-orthogonal associative pairs are superimposed onto finite mathematical coordinates.',
    formula: '\\hat{v} = k_1^\\top M = \\|k_1\\|^2 v_1 + \\sum_{i \\ne 1} (k_1^\\top k_i) v_i',
    formulaExplanation:
      'Probing memory with key k_1 yields the target signal (||k_1||^2 v_1) plus an interference summation term \\sum_{i \\ne 1} (k_1^T k_i) v_i. If the dot products k_1^T k_i are non-zero, cross-talk noise pollutes the retrieved vector.',
    deepDive:
      'In any finite d-dimensional vector space, at most d mutually orthogonal vectors can coexist. Once the number of written facts N exceeds d, the Pigeonhole Principle forces vectors to have non-zero inner products. As more distractors are written, the accumulated cross-talk noise eventually overpowers the true target vector, causing the model prediction to flip from "Tokyo" to an erroneous candidate.',
    intuition:
      'Imagine drawing multiple sketches on a single translucent sheet of tracing paper. With two sketches, you can easily tell them apart. But after overlaying ten sketches on the exact same sheet, lines intersect and bleed together until individual drawings become unrecognizable.',
    empiricalRole:
      'Section 04 (Interference Lab) and Section 05 (Find The Failure) demonstrate this directly: adding 8 distractors into a low-dimensional state (D=8) reduces the Top-1 margin to near zero or negative, flipping the model output from Correct to Interference.',
    relatedTerms: ['superposition', 'top-1-margin', 'orthogonal-projections', 'frobenius-norm'],
    targetPage: 'break',
    targetSectionId: 'interference-lab',
  },

  'retention-coefficient': {
    id: 'retention-coefficient',
    term: 'Retention Coefficient (λ)',
    aliases: ['lambda', 'decay factor', 'memory discount', 'forgetting rate', 'leaky integration'],
    category: 'Foundations',
    shortDefinition:
      'The exponential discount multiplier governing how much existing matrix state is preserved versus decayed at each discrete timestep.',
    formula: 'M_{t} = \\lambda M_{t-1} + \\eta k_t v_t^\\top, \\quad \\lambda \\in [0, 1]',
    formulaExplanation:
      'When λ = 1.0, memory is perfectly preserved with zero decay (infinite half-life). When λ = 0, prior memory is wiped completely at each step. Typical values (0.90 to 0.98) provide a balanced moving-average horizon.',
    deepDive:
      'Retention parameterizes the effective half-life of memories in recurrent fast-weights according to t_{1/2} = \\frac{\\ln(0.5)}{\\ln(\\lambda)}. Setting λ < 1 prevents numerical overflow and naturally creates recency bias, allowing the system to shed stale interference in exchange for gradually forgetting older memories.',
    intuition:
      'Think of writing with ink that slowly evaporates under warm light. Fresh strokes are dark and legible; as hours pass, older writing gradually fades to faint gray, leaving clean headroom for newly incoming words.',
    empiricalRole:
      'Adjusting the Retention slider from 95% down to 55% in the laboratory forces rapid exponential decay: older country facts like Japan dissolve after just 3 or 4 distractor steps, demonstrating why λ must match task context length.',
    relatedTerms: ['recurrent-state', 'write-strength', 'frobenius-norm'],
    targetPage: 'memory',
    targetSectionId: 'section-03',
  },

  'write-strength': {
    id: 'write-strength',
    term: 'Write Strength (η)',
    aliases: ['eta', 'learning rate', 'update gain', 'imprinting strength', 'write rate'],
    category: 'Foundations',
    shortDefinition:
      'The scalar gain factor determining how strongly a single new association imprints onto the recurrent memory substrate.',
    formula: '\\Delta M = \\eta \\cdot (k_t v_t^\\top), \\quad \\eta > 0',
    formulaExplanation:
      'A higher η writes the new outer product with high initial amplitude, making the newest fact immediately prominent at the cost of competing with existing associations.',
    deepDive:
      'Write strength acts as an instantaneous signal-to-noise lever. If η is set too low relative to matrix scale, newly incoming facts cannot overcome existing background activations. If η is set too high, each incoming observation overwrites prior knowledge like a hammer strike, inducing catastrophic forgetting.',
    intuition:
      'Adjusting write strength is like pressing a rubber stamp down onto paper: pressing lightly leaves a faint impression that might get obscured by other marks; pressing too hard saturates the paper and bleeds through everything else.',
    empiricalRole:
      'Our parameter slider allows values η ∈ [0.1, 2.0]. Boosting η to 1.8 makes the active country readout extremely resilient against early noise, but causes late distractor steps to rapidly obliterate early memories.',
    relatedTerms: ['retention-coefficient', 'hebbian-plasticity', 'recurrent-state'],
    targetPage: 'memory',
    targetSectionId: 'section-03',
  },

  'top-1-margin': {
    id: 'top-1-margin',
    term: 'Top-1 Decision Margin',
    aliases: ['confidence gap', 'retrieval margin', 'decision boundary separation', 'score delta'],
    category: 'Mathematical Tools',
    shortDefinition:
      'The numerical difference between the similarity score of the top-ranked retrieved candidate and that of the second-ranked runner-up.',
    formula: '\\Delta_{\\text{margin}} = \\operatorname{score}(\\hat{v}, c_{(1)}) - \\operatorname{score}(\\hat{v}, c_{(2)})',
    formulaExplanation:
      'c_{(1)} is the closest candidate embedding to retrieved vector v̂ under cosine similarity, and c_{(2)} is the runner-up. A large positive margin indicates high certainty; a margin near zero indicates ambiguous hesitation; a negative margin indicates retrieval error.',
    deepDive:
      'Decision margins provide a much more reliable metric of associative robustness than raw top-1 accuracy alone. While a prediction can remain technically correct with a razor-thin margin (e.g., +0.02), any minuscule perturbation or added distractor will immediately tip the classification into failure.',
    intuition:
      'Think of a photo finish in a track race: winning by 10 meters (high margin) means you comfortably dominated the field. Winning by half a millisecond (low margin) means a slight gust of wind could have cost you the victory.',
    empiricalRole:
      'The Top-1 Margin readout in our header telemetry turns green when > 0.35, amber when between 0.10 and 0.35, and red when < 0.10 or negative, giving you an early warning before categorical failure occurs.',
    relatedTerms: ['capacity-interference', 'cosine-similarity', 'frobenius-norm'],
    targetPage: 'trace',
    targetSectionId: 'section-04',
  },

  'kv-cache': {
    id: 'kv-cache',
    term: 'KV Cache',
    aliases: ['key-value cache', 'attention buffer', 'autoregressive cache', 'Transformer context window'],
    category: 'Architectures & Models',
    shortDefinition:
      'The memory mechanism used in standard Transformers that stores the uncompressed keys and values of every historical token across all attention layers.',
    formula: '\\text{VRAM} \\approx 2 \\cdot b \\cdot L \\cdot h \\cdot d_{\\text{head}} \\cdot T \\quad (O(T) \\text{ linear growth})',
    formulaExplanation:
      'Where b is batch size, L is number of layers, h is attention heads, d_{head} is head dimension, and T is sequence length. Memory grows strictly with context length T.',
    deepDive:
      'The KV-cache is the reason large language models exhibit near-flawless in-context retrieval across thousands of tokens: every token representation is preserved with full fidelity. However, because memory consumption and attention matrix generation scale linearly and quadratically with sequence length, deploying models with 1M+ context tokens incurs massive GPU memory costs.',
    intuition:
      'Imagine saving every single grocery receipt, sticky note, and ticket stub in shoeboxes in your living room. You never forget a single purchase, but eventually you run out of physical floor space in your house.',
    empiricalRole:
      'Section 02 contrasts the linear O(T) footprint of KV-caching directly against the constant O(1) profile of recurrent memory, illustrating why biological brains and next-generation architectures pursue recurrent compression.',
    relatedTerms: ['recurrent-state', 'capacity-interference', 'bdh-architecture'],
    targetPage: 'memory',
    targetSectionId: 'section-02',
  },

  'superposition': {
    id: 'superposition',
    term: 'Neural Superposition',
    aliases: ['compressed sensing', 'high-dimensional packing', 'polysemanticity', 'almost-orthogonal vectors'],
    category: 'Foundations',
    shortDefinition:
      'The mathematical property enabling high-dimensional vector spaces to represent vastly more than d distinct concepts by tolerating bounded non-orthogonal interference.',
    formula: 'N \\gg d \\quad \\text{such that} \\quad |\\langle x_i, x_j \\rangle| \\le \\epsilon \\quad \\forall i \\ne j',
    formulaExplanation:
      'In dimension d, the Johnson-Lindenstrauss lemma and compressed sensing theorems prove that exponentially many unit vectors can be packed such that all pairwise inner products remain bounded below small tolerance ε.',
    deepDive:
      'Anthropic and mechanistic interpretability researchers popularized superposition to explain why neural networks can understand millions of concepts with hidden layers containing only thousands of neurons. Sparse activation prevents all features from firing simultaneously, keeping total interference below the noise threshold.',
    intuition:
      'Think of an orchestra: 80 musicians play different instruments simultaneously, yet you can discern the violin soloist because human auditory processing separates overlapping frequencies unless the brass section becomes overwhelmingly loud.',
    empiricalRole:
      'In our lab, raising Dimension D from 8 to 32 expands the geometric volume, allowing country-capital pairs to coexist in superposition with vastly diminished cross-talk.',
    relatedTerms: ['capacity-interference', 'orthogonal-projections', 'recurrent-state'],
    targetPage: 'break',
    targetSectionId: 'section-04',
  },

  'orthogonal-projections': {
    id: 'orthogonal-projections',
    term: 'Orthogonal Projections',
    aliases: ['orthogonality', 'zero cross-talk', 'inner product zero', 'perpendicular vectors'],
    category: 'Mathematical Tools',
    shortDefinition:
      'Vectors oriented at 90-degree angles in hyperspace with zero dot product, guaranteeing total absence of mutual cross-talk during associative dot-product readout.',
    formula: '\\langle k_i, k_j \\rangle = k_i^\\top k_j = 0 \\quad (\\forall i \\ne j)',
    formulaExplanation:
      'When key vectors are perpendicular, multiplying query q = k_i across memory extracts purely the corresponding value v_i without any leakage from other stored memories.',
    deepDive:
      'Orthogonality represents the ideal geometric condition for linear associative memory. In dimension d, exactly d mutually orthogonal directions exist. High dimensions (d=512, 4096) provide vast quasi-orthogonal capacity, explaining why production neural networks operate in thousands of dimensions.',
    intuition:
      'Imagine two radio stations broadcasting on completely separate, non-overlapping frequency bands: your car radio tunes into one without hearing a single crackle of static from the other.',
    empiricalRole:
      'When you inspect key vectors in the Heatmap, pairs with low cosine similarity demonstrate crisp, unambiguous retrieval with 0.99+ scores.',
    relatedTerms: ['capacity-interference', 'outer-product-update', 'cosine-similarity'],
    targetPage: 'measure',
    targetSectionId: 'section-04',
  },

  'bdh-architecture': {
    id: 'bdh-architecture',
    term: 'BDH Architecture',
    aliases: ['Baby Dragon Hatchling', 'recurrent plastic network', 'neuronal fast-weights', 'Pathway BDH'],
    category: 'Architectures & Models',
    shortDefinition:
      'A biologically inspired recurrent architecture where long-term knowledge and short-term working memory co-reside in plastic synaptic weights that update locally.',
    formula: '\\sigma_{ij}^{(t+1)} = \\lambda \\sigma_{ij}^{(t)} + \\eta \\cdot x_i^{(t)} y_j^{(t)}',
    formulaExplanation:
      'Synaptic conductivity σ_{ij} between neurons i and j updates using purely local pre- and postsynaptic activities x_i and y_j, without global error backpropagation.',
    deepDive:
      'Introduced in modern memory research, BDH (Baby Dragon Hatchling) demonstrates how networks can synthesize ongoing context through continuous local synaptic adaptation. By decoupling memory retention from the KV-cache, BDH maintains constant compute and memory footprints across arbitrarily long context streams.',
    intuition:
      'Instead of an AI consulting a separate external notebook (KV-cache) for every word it speaks, BDH operates like living brain tissue: processing a thought physically alters the synaptic synapses between its neurons in real time.',
    empiricalRole:
      'Section 07 and Section 08 introduce BDH principles, showing how decentralized local plasticity solves the memory scalability problem encountered in earlier sections.',
    relatedTerms: ['hebbian-plasticity', 'latent-reasoning', 'recurrent-state'],
    targetPage: 'bdh',
    targetSectionId: 'section-07',
  },

  'latent-reasoning': {
    id: 'latent-reasoning',
    term: 'Latent Reasoning',
    aliases: ['latent thinking', 'internal recurrence', 'system-2 relaxation', 'non-verbal reasoning', 'iterative convergence'],
    category: 'Architectures & Models',
    shortDefinition:
      'Executing multi-step deduction, constraint satisfaction, and problem solving through iterative internal state relaxation rather than generating external text tokens.',
    formula: 's_{t, k+1} = \\operatorname{Relax}(s_{t, k}, W_{\\text{plastic}}) \\quad \\text{for } k=1 \\dots K',
    formulaExplanation:
      'State s evolves over K recurrent iterations at the same token position t, allowing internal activations to stabilize onto an attractor before emitting output.',
    deepDive:
      'Standard language models must generate visible chain-of-thought tokens ("Let\'s think step by step...") to perform multi-hop reasoning. In contrast, recurrent networks with attractor dynamics can iterate through internal computational depth (latent steps), resolving dependencies within the hidden state manifold before producing a single token.',
    intuition:
      'When you solve a chess puzzle, you pause and mentally simulate five moves ahead in your head before physically touching a piece, rather than needing to say every possibility out loud.',
    empiricalRole:
      'In Section 09 and Section 10 (BDH-CQ Playground), you can manipulate latent reasoning steps (k=1 to k=6) and observe internal state convergence prior to readout.',
    relatedTerms: ['bdh-architecture', 'recurrent-state', 'superposition'],
    targetPage: 'reason',
    targetSectionId: 'section-09',
  },

  'cosine-similarity': {
    id: 'cosine-similarity',
    term: 'Cosine Similarity',
    aliases: ['normalized dot product', 'cosine score', 'angular alignment', 'retrieval score'],
    category: 'Mathematical Tools',
    shortDefinition:
      'A metric quantifying the directional alignment between two vectors, normalized between -1 and +1 regardless of their vector magnitudes.',
    formula: '\\operatorname{sim}(u, v) = \\frac{u \\cdot v}{\\|u\\|_2 \\|v\\|_2} = \\cos(\\theta) \\in [-1, +1]',
    formulaExplanation:
      'Dividing the dot product by the Euclidean L2 norms of both vectors isolates the cosine of the angle θ between them: +1 means identical direction, 0 means perpendicular, and -1 means opposing direction.',
    deepDive:
      'Because associative readouts in recurrent matrices can vary in magnitude as norm ||M||_F fluctuates, raw dot products can be distorted by vector scale. Cosine similarity standardizes the readout against all canonical candidate embeddings in candidate memory, ensuring fair classification.',
    intuition:
      'Imagine two compass needles: cosine similarity tells you whether they are pointing in the exact same direction on the compass rose, regardless of how long or short the needles are.',
    empiricalRole:
      'The "Retrieval Score" in our hero instrument (e.g. 0.9858) is the direct cosine similarity between retrieved readout vector v̂ and target candidate embedding v_{Tokyo}.',
    relatedTerms: ['top-1-margin', 'orthogonal-projections', 'frobenius-norm'],
    targetPage: 'measure',
    targetSectionId: 'section-measure',
  },
};

/**
 * Lookup helper: matches exact ID, term title, or alias (case-insensitive)
 */
export function findGlossaryTerm(query: string): GlossaryTerm | undefined {
  if (!query) return undefined;
  const normalized = query.trim().toLowerCase().replace(/['"_\-]/g, ' ');

  // 1. Direct ID match
  if (GLOSSARY_TERMS[query]) {
    return GLOSSARY_TERMS[query];
  }

  // 2. ID normalized
  const byId = Object.values(GLOSSARY_TERMS).find(
    (item) => item.id.replace(/-/g, ' ') === normalized
  );
  if (byId) return byId;

  // 3. Name or alias match
  return Object.values(GLOSSARY_TERMS).find((item) => {
    const termNorm = item.term.toLowerCase().replace(/['"_\-]/g, ' ');
    if (termNorm === normalized || termNorm.includes(normalized) || normalized.includes(termNorm)) {
      return true;
    }
    return item.aliases.some((alias) => {
      const aliasNorm = alias.toLowerCase().replace(/['"_\-]/g, ' ');
      return aliasNorm === normalized || aliasNorm.includes(normalized) || normalized.includes(aliasNorm);
    });
  });
}
