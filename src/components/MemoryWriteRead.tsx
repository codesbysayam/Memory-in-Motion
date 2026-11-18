import React, { useState, useMemo } from 'react';
import {
  ArrowRight,
  Database,
  Search,
  RotateCcw,
  Award,
  HelpCircle,
} from 'lucide-react';
import { Fact, CANONICAL_FACTS, createAssociativeMemory, vector } from '../models/associativeMemory';
import { MatrixDiff } from './MatrixDiff';
import { MathView } from './ui/MathView';

interface MemoryWriteReadProps {
  initialFact?: Fact;
  dimension?: number;
  retention?: number;
  writeStrength?: number;
}

export const MemoryWriteRead: React.FC<MemoryWriteReadProps> = ({
  initialFact = { key: 'Japan', value: 'Tokyo', category: 'Asia' },
  dimension = 16,
  retention = 0.95,
  writeStrength = 0.8,
}) => {
  // Fact selection
  const [selectedFact, setSelectedFact] = useState<Fact>(initialFact);
  const [queryInput, setQueryInput] = useState<string>('Japan');

  // Interactive Stage:
  // 0: INPUT (Key, Value selected)
  // 1: ENCODE (Numerical vectors generated)
  // 2: WRITE (Outer product M_(t+1) = λM_t + η k v^T)
  // 3: MEMORY STATE (Current M inspected)
  // 4: QUERY (Query string & query vector q)
  // 5: READ (Retrieved vector \hat{v} = q^T M)
  // 6: RETRIEVAL (Candidate cosine scores & Top-1 margin)
  const [stage, setStage] = useState<number>(0);
  const [selectedCandidate, setSelectedCandidate] = useState<string | null>('Tokyo');

  const STAGES = [
    { num: 0, label: 'INPUT', desc: 'Human-readable key-value pair' },
    { num: 1, label: 'ENCODE', desc: 'Convert text to deterministic vectors' },
    { num: 2, label: 'WRITE', desc: 'Associative outer-product matrix update' },
    { num: 3, label: 'MEMORY STATE', desc: 'Superimposed matrix state' },
    { num: 4, label: 'QUERY', desc: 'Probe query vector' },
    { num: 5, label: 'READ', desc: 'Vector-matrix multiplication q^T M' },
    { num: 6, label: 'RETRIEVAL', desc: 'Candidate similarity decoding' },
  ];

  // Run the actual deterministic associative memory
  const {
    matrixBefore,
    matrixAfter,
    keyVec,
    valVec,
    queryVec,
    retrievedVec,
    candidates,
    topCandidate,
    secondCandidate,
    top1Margin,
    prediction,
  } = useMemo(() => {
    // 1. Create fresh memory and seed with 2 prior facts so "before" isn't all zeros
    const priorFacts: Fact[] = [
      { key: 'France', value: 'Paris', category: 'Europe' },
      { key: 'Brazil', value: 'Brasília', category: 'South America' },
    ];
    const memory = createAssociativeMemory(
      [...priorFacts, selectedFact, ...CANONICAL_FACTS.slice(3, 8)],
      dimension,
      retention,
      writeStrength
    );

    // Ingest prior facts
    priorFacts.forEach((f) => memory.writeFact(f));
    const matBefore = memory.getMatrix();

    // Now write the selected fact
    memory.writeFact(selectedFact);
    const matAfter = memory.getMatrix();

    // Vectors
    const kVec = vector(selectedFact.key, dimension);
    const vVec = vector(selectedFact.value, dimension);
    const qVec = vector(queryInput, dimension);

    // Query result
    const qRes = memory.query(queryInput);

    // Margin calculations
    const sorted = [...qRes.candidates].sort((a, b) => b.score - a.score);
    const top = sorted[0];
    const second = sorted[1];
    const margin = top && second ? Math.max(0, top.score - second.score) : top ? top.score : 0;

    return {
      matrixBefore: matBefore,
      matrixAfter: matAfter,
      keyVec: kVec,
      valVec: vVec,
      queryVec: qVec,
      retrievedVec: qRes.vector,
      candidates: sorted.slice(0, 5),
      topCandidate: top,
      secondCandidate: second,
      top1Margin: margin,
      prediction: qRes.prediction,
    };
  }, [selectedFact, queryInput, dimension, retention, writeStrength]);

  const nextStage = () => setStage((prev) => Math.min(6, prev + 1));
  const prevStage = () => setStage((prev) => Math.max(0, prev - 1));
  const resetStage = () => setStage(0);

  return (
    <div className="diagram-frame p-5 sm:p-6 text-[var(--text-primary)] space-y-6 font-mono tabular-nums">
      {/* Header & Epistemic Credentials */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--border)] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5 text-[var(--accent-blue-text)]" />
            <h3 className="text-base font-semibold text-[var(--text-primary)]">
              Mechanistic memory inspector: write / read pipeline
            </h3>
          </div>
          <p className="text-xs text-[var(--text-secondary)] mt-1 font-sans">
            Follow the complete deterministic computation: Input → Encode → Write → State → Query → Read → Retrieval.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs px-2.5 py-1 rounded-md bg-[var(--accent-blue)] border border-[var(--border)] text-[var(--accent-blue-text)] font-semibold">
            Live computation
          </span>
          <span className="text-xs px-2 py-0.5 rounded-md bg-[var(--surface-soft)] border border-[var(--border)] text-[var(--text-muted)]">
            d={dimension}
          </span>
        </div>
      </div>

      {/* 7-Step Pipeline Stepper Bar */}
      <div className="space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
          <span className="text-[var(--text-muted)] font-semibold">
            Computational pipeline ({stage + 1}/7): <strong className="text-[var(--accent-blue-text)]">{STAGES[stage].label}</strong>
          </span>
          <span className="text-xs text-[var(--text-secondary)] font-sans">{STAGES[stage].desc}</span>
        </div>

        <div className="grid grid-cols-7 gap-1.5">
          {STAGES.map((s) => (
            <button
              key={s.num}
              type="button"
              onClick={() => setStage(s.num)}
              className={`py-2 px-1 text-center rounded-lg border text-xs font-semibold transition-all cursor-pointer ${
                stage === s.num
                  ? 'bg-[var(--accent-blue)] border-[var(--color-accent)] text-[var(--accent-blue-text)] shadow-xs'
                  : stage > s.num
                  ? 'bg-[var(--surface-soft)] border-[var(--border)] text-[var(--text-primary)] hover:border-[var(--color-border-strong)]'
                  : 'bg-[var(--surface)] border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text-primary)]'
              }`}
            >
              <div className="hidden sm:block text-[11px] text-[var(--text-muted)] mb-0.5 font-normal">Step {s.num + 1}</div>
              <div className="truncate">{s.label}</div>
            </button>
          ))}
        </div>

        {/* Stepper Controls */}
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={prevStage}
              disabled={stage === 0}
              className="btn-secondary text-xs py-1.5 px-3 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              ← Previous step
            </button>
            <button
              type="button"
              onClick={nextStage}
              disabled={stage === 6}
              className="btn-primary text-xs py-1.5 px-3.5 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Next step →
            </button>
          </div>

          <button
            type="button"
            onClick={resetStage}
            className="btn-tertiary text-xs"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset pipeline</span>
          </button>
        </div>
      </div>

      {/* Main Interactive Stage Display */}
      <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] p-5 space-y-4">
        {/* STAGE 0: INPUT */}
        {stage === 0 && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--border)] pb-2">
              <span className="text-xs font-semibold text-[var(--accent-blue-text)]">
                Step 1: Human-readable input
              </span>
              <span className="text-xs text-[var(--text-muted)] font-sans">Select key-value pair to write into memory</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3.5 rounded-xl bg-[var(--surface)] border border-[var(--border)] space-y-2">
                <span className="text-xs text-[var(--text-muted)] font-semibold block">
                  Selected fact (Key → Value)
                </span>
                <div className="text-base font-bold text-[var(--text-primary)] flex items-center gap-2">
                  <span className="text-[var(--accent-yellow-text)]">{selectedFact.key}</span>
                  <ArrowRight className="w-4 h-4 text-[var(--text-muted)]" />
                  <span className="text-[var(--accent-blue-text)]">{selectedFact.value}</span>
                </div>
                <p className="text-xs text-[var(--text-secondary)] font-sans">
                  Human readers understand the semantic association between &ldquo;{selectedFact.key}&rdquo; and &ldquo;{selectedFact.value}&rdquo;. The computational model does not.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-[var(--surface)] border border-[var(--border)] space-y-2">
                <span className="text-xs text-[var(--text-muted)] font-semibold block">
                  Choose a sample fact
                </span>
                <div className="grid grid-cols-2 gap-1.5">
                  {CANONICAL_FACTS.slice(0, 4).map((f) => (
                    <button
                      key={f.key}
                      type="button"
                      onClick={() => {
                        setSelectedFact(f);
                        setQueryInput(f.key);
                      }}
                      className={`py-1.5 px-2 rounded-lg text-xs border text-left truncate transition cursor-pointer ${
                        selectedFact.key === f.key
                          ? 'bg-[var(--accent-blue)] border-[var(--color-accent)] text-[var(--accent-blue-text)] font-bold'
                          : 'bg-[var(--surface-soft)] border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                      }`}
                    >
                      {f.key} → {f.value}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-[var(--surface)] border border-[var(--border)] text-xs text-[var(--text-secondary)] font-sans">
              <strong className="text-[var(--text-primary)]">What happens next:</strong> In Step 2, both strings are converted into deterministic numerical coordinate vectors in <MathView math={`\\mathbb{R}^{${dimension}}`} />.
            </div>
          </div>
        )}

        {/* STAGE 1: ENCODE */}
        {stage === 1 && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--border)] pb-2">
              <span className="text-xs font-semibold text-[var(--accent-blue-text)]">
                Step 2: Encode text to latent vectors
              </span>
              <span className="text-xs text-[var(--text-muted)] font-sans">Deterministic representation mapping</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-3.5 rounded-xl bg-[var(--surface)] border border-[var(--border)] space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-[var(--accent-yellow-text)]">Key vector: k = &ldquo;{selectedFact.key}&rdquo;</span>
                  <span className="text-xs text-[var(--text-muted)]">dim={dimension}</span>
                </div>
                <div className="p-2 bg-[var(--surface-soft)] rounded-lg border border-[var(--border)] text-xs text-[var(--text-secondary)] overflow-x-auto">
                  [{keyVec.slice(0, 8).map((x) => x.toFixed(2)).join(', ')} ... ]
                </div>
                <span className="text-xs text-[var(--text-muted)] font-sans block">
                  Used as the associative addressing key for outer-product write and query retrieval.
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-[var(--surface)] border border-[var(--border)] space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-[var(--accent-blue-text)]">Value vector: v = &ldquo;{selectedFact.value}&rdquo;</span>
                  <span className="text-xs text-[var(--text-muted)]">dim={dimension}</span>
                </div>
                <div className="p-2 bg-[var(--surface-soft)] rounded-lg border border-[var(--border)] text-xs text-[var(--text-secondary)] overflow-x-auto">
                  [{valVec.slice(0, 8).map((x) => x.toFixed(2)).join(', ')} ... ]
                </div>
                <span className="text-xs text-[var(--text-muted)] font-sans block">
                  The target numerical pattern to be etched into the memory state matrix.
                </span>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-[var(--surface)] border border-[var(--border)] text-xs text-[var(--text-secondary)] font-sans">
              <strong className="text-[var(--text-primary)]">Core rule:</strong> The educational model does not manipulate text directly. It converts each item into a deterministic numerical representation.
            </div>
          </div>
        )}

        {/* STAGE 2: WRITE */}
        {stage === 2 && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--border)] pb-2">
              <span className="text-xs font-semibold text-[var(--accent-blue-text)]">
                Step 3: Write update (M_(t+1) = λM_t + η k v^T)
              </span>
              <span className="text-xs text-[var(--text-muted)] font-sans">Associative outer-product addition</span>
            </div>

            <p className="text-xs text-[var(--text-secondary)] font-sans leading-relaxed">
              <strong className="text-[var(--text-primary)]">Write changes the internal memory representation.</strong> The outer product <MathView math="k v^T" /> constructs a {dimension}×{dimension} matrix binding key coordinates to value coordinates, weighted by write strength <MathView math={`\\eta = ${writeStrength}`} /> and decayed by retention <MathView math={`\\lambda = ${retention}`} />.
            </p>

            {/* Matrix Diff Inspector */}
            <MatrixDiff matrixBefore={matrixBefore} matrixAfter={matrixAfter} dimension={dimension} />
          </div>
        )}

        {/* STAGE 3: MEMORY STATE */}
        {stage === 3 && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--border)] pb-2">
              <span className="text-xs font-semibold text-[var(--accent-blue-text)]">
                Step 4: Current memory state inspection
              </span>
              <span className="text-xs text-[var(--text-muted)] font-sans">Full {dimension}×{dimension} associative matrix</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
              <div className="md:col-span-8">
                <div
                  className="grid gap-[2px] p-3 bg-[var(--color-matrix-bg)] rounded-xl border border-[var(--color-matrix-border)]"
                  style={{ gridTemplateColumns: `repeat(${Math.min(16, dimension)}, minmax(0, 1fr))` }}
                >
                  {Array.from({ length: Math.min(16, dimension) }).map((_, r) =>
                    Array.from({ length: Math.min(16, dimension) }).map((_, c) => {
                      const val = matrixAfter[r]?.[c] ?? 0;
                      return (
                        <div
                          key={`st-${r}-${c}`}
                          className="aspect-square rounded-[2px]"
                          style={{
                            backgroundColor:
                              val >= 0
                                ? `rgba(76, 154, 255, ${Math.max(0.14, Math.min(1, Math.abs(val)))})`
                                : `rgba(229, 98, 90, ${Math.max(0.14, Math.min(1, Math.abs(val)))})`,
                          }}
                          title={`M[${r}][${c}] = ${val.toFixed(4)}`}
                        />
                      );
                    })
                  )}
                </div>
              </div>

              <div className="md:col-span-4 space-y-3 text-xs">
                <div className="p-3.5 rounded-xl bg-[var(--surface)] border border-[var(--border)] space-y-1">
                  <span className="text-xs text-[var(--text-muted)] font-semibold block">Superposition state</span>
                  <p className="text-[var(--text-secondary)] font-sans text-xs leading-relaxed">
                    Notice that individual facts do not occupy separate memory slots or linear token lists. All past bindings are superimposed directly into these {dimension * dimension} matrix coordinates.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-[var(--surface)] border border-[var(--border)] space-y-1">
                  <span className="text-xs text-[var(--accent-blue-text)] font-semibold block">Constant memory bound</span>
                  <p className="text-[var(--text-secondary)] font-sans text-xs">
                    Size remains exactly {dimension}×{dimension} floating-point values, regardless of whether 2 facts or 200 facts have been written.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STAGE 4: QUERY */}
        {stage === 4 && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--border)] pb-2">
              <span className="text-xs font-semibold text-[var(--accent-blue-text)]">
                Step 5: Query probe
              </span>
              <span className="text-xs text-[var(--text-muted)] font-sans">Generate query probe vector q</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3.5 rounded-xl bg-[var(--surface)] border border-[var(--border)] space-y-2">
                <span className="text-xs text-[var(--text-muted)] font-semibold block">
                  Query string
                </span>
                <div className="text-base font-bold text-[var(--text-primary)] flex items-center gap-2">
                  <Search className="w-4 h-4 text-[var(--accent-blue-text)]" />
                  <span>&ldquo;{queryInput}&rdquo;</span>
                </div>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {CANONICAL_FACTS.slice(0, 4).map((f) => (
                    <button
                      key={f.key}
                      type="button"
                      onClick={() => setQueryInput(f.key)}
                      className={`px-2 py-1 rounded-lg text-xs border transition cursor-pointer ${
                        queryInput === f.key
                          ? 'bg-[var(--accent-blue)] border-[var(--color-accent)] text-[var(--accent-blue-text)] font-bold'
                          : 'bg-[var(--surface-soft)] border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                      }`}
                    >
                      {f.key}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-[var(--surface)] border border-[var(--border)] space-y-2">
                <span className="text-xs text-[var(--text-muted)] font-semibold block">
                  Query vector q = vector(&ldquo;{queryInput}&rdquo;, {dimension})
                </span>
                <div className="p-2 bg-[var(--surface-soft)] rounded-lg border border-[var(--border)] text-xs text-[var(--text-secondary)] overflow-x-auto">
                  [{queryVec.slice(0, 8).map((x) => x.toFixed(2)).join(', ')} ... ]
                </div>
                <p className="text-xs text-[var(--text-muted)] font-sans">
                  The query vector acts as an algebraic projection probe multiplying against columns of the matrix state.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* STAGE 5: READ */}
        {stage === 5 && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--border)] pb-2">
              <span className="text-xs font-semibold text-[var(--accent-blue-text)] inline-flex items-center gap-1.5">
                Step 6: Read operation (<MathView math="\hat{v} = q^T M" />)
              </span>
              <span className="text-xs text-[var(--text-muted)] font-sans">Linear readout from continuous state</span>
            </div>

            <p className="text-xs text-[var(--text-secondary)] font-sans leading-relaxed">
              <strong className="text-[var(--text-primary)]">Read retrieves information from that representation.</strong> The probe query vector multiplies against the memory matrix: <MathView math="\hat{v}_j = \sum_i q_i M_{ij}" />.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-3.5 rounded-xl bg-[var(--surface)] border border-[var(--border)] space-y-2">
                <span className="text-xs text-[var(--text-muted)] font-semibold block">
                  Query probe vector (q)
                </span>
                <div className="p-2 bg-[var(--surface-soft)] rounded-lg border border-[var(--border)] text-xs text-[var(--text-secondary)] overflow-x-auto">
                  [{queryVec.slice(0, 8).map((x) => x.toFixed(2)).join(', ')} ... ]
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-[var(--surface)] border border-[var(--border)] space-y-2">
                <span className="text-xs text-[var(--accent-blue-text)] font-semibold block">
                  Reconstructed value vector (<MathView math="\hat{v}" />)
                </span>
                <div className="p-2 bg-[var(--surface-soft)] rounded-lg border border-[var(--border)] text-xs text-[var(--accent-blue-text)] overflow-x-auto font-bold">
                  [{retrievedVec.slice(0, 8).map((x) => x.toFixed(2)).join(', ')} ... ]
                </div>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-[var(--surface)] border border-[var(--border)] text-xs text-[var(--text-secondary)] font-sans">
              <strong className="text-[var(--text-primary)]">Notice:</strong> The reconstructed vector is a noisy superposition of all written items that share overlapping coordinates. In Step 7, we compare it to candidate values.
            </div>
          </div>
        )}

        {/* STAGE 6: RETRIEVAL & WHY THIS QUERY WON */}
        {stage === 6 && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--border)] pb-2">
              <span className="text-xs font-semibold text-[var(--accent-blue-text)]">
                Step 7: Retrieval decoding &amp; why this query won
              </span>
              <span className="text-xs text-[var(--text-muted)] font-sans">Candidate ranking &amp; Top-1 margin</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-start">
              {/* Left side: Candidate Activation Bars */}
              <div className="md:col-span-7 space-y-3 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-[var(--text-muted)] font-semibold">
                    Candidate activation (cosine similarity to <MathView math="\hat{v}" />)
                  </span>
                  <span className="text-xs text-[var(--text-muted)]">Retrieval score</span>
                </div>

                <div className="space-y-2">
                  {candidates.map((c, idx) => {
                    const isTop = idx === 0;
                    const isTarget = c.value === selectedFact.value;
                    const scoreWidth = Math.max(4, Math.min(100, Math.round(((c.score + 1) / 2) * 100)));

                    return (
                      <div
                        key={c.value}
                        onClick={() => setSelectedCandidate(c.value)}
                        className={`p-2.5 rounded-xl border cursor-pointer transition-all ${
                          selectedCandidate === c.value
                            ? 'bg-[var(--accent-blue)] border-[var(--color-accent)] text-[var(--text-primary)]'
                            : 'bg-[var(--surface)] border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--color-border-strong)]'
                        }`}
                      >
                        <div className="flex justify-between items-center text-xs mb-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs font-bold text-[var(--text-muted)]">#{idx + 1}</span>
                            <span className="font-bold text-[var(--text-primary)]">{c.value}</span>
                            {isTop && (
                              <span className="text-[11px] px-1.5 py-0.5 rounded bg-[var(--accent-green)] border border-[var(--color-success-border)] text-[var(--accent-green-text)] font-semibold">
                                Prediction
                              </span>
                            )}
                            {isTarget && (
                              <span className="text-[11px] px-1.5 py-0.5 rounded bg-[var(--accent-blue)] border border-[var(--border)] text-[var(--accent-blue-text)] font-semibold">
                                Ground truth
                              </span>
                            )}
                          </div>
                          <strong className={isTop ? 'text-[var(--accent-blue-text)] font-bold' : 'text-[var(--text-muted)]'}>
                            {c.score.toFixed(3)}
                          </strong>
                        </div>

                        {/* Bar */}
                        <div className="w-full bg-[var(--border)] rounded-sm h-1.5 overflow-hidden">
                          <div
                            className={`h-1.5 rounded-sm transition-all duration-300 ${
                              isTop ? 'bg-[var(--color-accent)]' : 'bg-[var(--text-muted)]'
                            }`}
                            style={{ width: `${scoreWidth}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Right side: Why This Query Won Card */}
              <div className="md:col-span-5 space-y-3 text-xs">
                <div className="p-4 rounded-xl bg-[var(--surface)] border border-[var(--border)] space-y-3">
                  <div className="flex items-center gap-1.5 text-[var(--accent-blue-text)] font-semibold border-b border-[var(--border)] pb-2">
                    <Award className="w-4 h-4" />
                    <span>Why did the model return &ldquo;{prediction}&rdquo;?</span>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between text-[var(--text-secondary)]">
                      <span>Top candidate:</span>
                      <strong className="text-[var(--text-primary)]">{topCandidate?.value} ({topCandidate?.score.toFixed(3)})</strong>
                    </div>
                    <div className="flex justify-between text-[var(--text-secondary)]">
                      <span>Runner-up:</span>
                      <strong className="text-[var(--text-muted)]">{secondCandidate?.value} ({secondCandidate?.score.toFixed(3)})</strong>
                    </div>
                    <div className="flex justify-between text-[var(--text-secondary)] border-t border-[var(--border)] pt-1.5">
                      <span className="font-semibold text-[var(--accent-blue-text)]">Top-1 margin:</span>
                      <strong className="text-[var(--accent-blue-text)] font-bold">{top1Margin.toFixed(3)}</strong>
                    </div>
                  </div>

                  <p className="text-xs text-[var(--text-secondary)] font-sans leading-relaxed pt-1 border-t border-[var(--border)]">
                    The retrieved representation <MathView math="\hat{v}" /> was more similar (higher cosine inner product) to the stored representation of &ldquo;{topCandidate?.value}&rdquo; than the other candidate values by a margin of <strong>{top1Margin.toFixed(3)}</strong>.
                  </p>

                  <div className="p-2.5 rounded-lg bg-[var(--surface-soft)] border border-[var(--border)] text-xs text-[var(--text-muted)] font-sans flex items-start gap-1.5">
                    <HelpCircle className="w-3.5 h-3.5 text-[var(--accent-blue-text)] shrink-0 mt-0.5" />
                    <span>
                      This score is computed from representation similarity in this toy&apos;s representation space. It is not a calibrated probability.
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Epistemic Safety Notice Footer */}
      <div className="p-3.5 rounded-xl bg-[var(--surface-soft)] border border-[var(--border)] text-xs text-[var(--text-secondary)] flex flex-wrap items-center justify-between gap-2 font-sans">
        <span>Write changes internal memory representation; Read retrieves information from that representation.</span>
        <span className="text-[var(--accent-yellow-text)] text-xs font-semibold">Educational model — does not claim to be the exact BDH production implementation.</span>
      </div>
    </div>
  );
};
