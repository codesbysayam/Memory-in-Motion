import React from 'react';
import { HelpCircle, AlertCircle, Database, Cpu, Lightbulb, ArrowRight } from 'lucide-react';
import { SectionHeader } from './ui/SectionHeader';

export const SoWhatSection: React.FC = () => {
  return (
    <section id="section-so-what" className="scroll-mt-20 border-b border-[#252A35] bg-[#07090F] py-14">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 space-y-8">
        <SectionHeader
          number="11"
          category="THE ARCHITECTURAL HORIZON"
          title="So What? Why Does Memory Architecture Matter?"
          subtitle="Beyond the equations and toy matrices: why rethinking how neural networks store working memory is foundational to the future of machine intelligence."
          discovery="Context windows cannot grow forever. Moving from external token caches to internal synaptic states transforms computation from memory-bound retrieval into active reasoning."
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-mono">
          {/* Pillar 1 */}
          <div className="rounded-2xl border border-[#222A3C] bg-[#0E121D] p-6 space-y-4">
            <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-800/50 text-amber-400 w-fit">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white uppercase tracking-wider">
              1. Context Windows Cannot Grow Forever
            </h3>
            <p className="text-xs text-slate-300 font-sans leading-relaxed">
              Standard transformers store every previous token in an expanding KV-cache. Even with quantization and flash attention:
            </p>
            <ul className="space-y-2 text-xs text-slate-400 font-sans">
              <li className="flex items-start gap-1.5">
                <span className="text-amber-400">•</span>
                <span><strong>Hardware Cost:</strong> Gigabytes of GPU VRAM consumed solely by passive token history.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-amber-400">•</span>
                <span><strong>Latency & Energy:</strong> Every token generation must attend over millions of historical key-values.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-amber-400">•</span>
                <span><strong>Attention Decay:</strong> "Lost-in-the-middle" effects degrade retrieval accuracy as context expands.</span>
              </li>
            </ul>
          </div>

          {/* Pillar 2 */}
          <div className="rounded-2xl border border-[#222A3C] bg-[#0E121D] p-6 space-y-4">
            <div className="p-3 rounded-xl bg-cyan-950/40 border border-cyan-800/50 text-cyan-400 w-fit">
              <Database className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white uppercase tracking-wider">
              2. Recurrent Compression Binds Memory
            </h3>
            <p className="text-xs text-slate-300 font-sans leading-relaxed">
              As demonstrated throughout our interactive lab:
            </p>
            <ul className="space-y-2 text-xs text-slate-400 font-sans">
              <li className="flex items-start gap-1.5">
                <span className="text-cyan-400">•</span>
                <span><strong>Bounded Footprint:</strong> A fixed recurrent state operates within constant O(1) memory bounds.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-cyan-400">•</span>
                <span><strong>Fundamental Tension:</strong> Compression inherently forces a trade-off between recall fidelity and coordinate capacity.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-cyan-400">•</span>
                <span><strong>Continuous Ingestion:</strong> The model absorbs incoming information online without rebooting attention passes.</span>
              </li>
            </ul>
          </div>

          {/* Pillar 3 */}
          <div className="rounded-2xl border border-[#222A3C] bg-[#0E121D] p-6 space-y-4">
            <div className="p-3 rounded-xl bg-purple-950/40 border border-purple-800/50 text-purple-400 w-fit">
              <Cpu className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white uppercase tracking-wider">
              3. Synapses Replace the KV Cache
            </h3>
            <p className="text-xs text-slate-300 font-sans leading-relaxed">
              The biological brain does not maintain a linear tape of every sensory token experienced:
            </p>
            <ul className="space-y-2 text-xs text-slate-400 font-sans">
              <li className="flex items-start gap-1.5">
                <span className="text-purple-400">•</span>
                <span><strong>Plastic Connections:</strong> Memory is etched directly into synaptic connections that rewire dynamically during thought.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-purple-400">•</span>
                <span><strong>Latent Reasoning:</strong> Multi-step problem solving occurs in recurrent state space without vocalizing verbal scratchpads.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-purple-400">•</span>
                <span><strong>Scale-Free Efficiency:</strong> Local Hebbian updates allow parallel execution across sparse connection graphs.</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
};
