import React from 'react';
import { AlertCircle, Database, Cpu } from 'lucide-react';
import { SectionHeader } from './ui/SectionHeader';

export const SoWhatSection: React.FC = () => {
  return (
    <section id="section-so-what" className="scroll-mt-20 border-b border-[#E5E0D8] bg-[#FBF9F5] py-20 text-[#151515]">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 space-y-10">
        <SectionHeader
          number="11"
          category="THE ARCHITECTURAL HORIZON"
          title="So what? Why does memory architecture matter?"
          subtitle="Beyond the equations and toy matrices: why rethinking how neural networks store working memory is foundational to the future of machine intelligence."
          discovery="Context windows cannot grow forever. Moving from external token caches to internal synaptic states transforms computation from memory-bound retrieval into active reasoning."
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-mono">
          {/* Pillar 1 */}
          <div className="rounded-2xl border border-[#E5E0D8] bg-[#FFFFFF] p-6 sm:p-7 space-y-4 shadow-xs">
            <div className="p-3 rounded-xl bg-[#FFF8EE] border border-[#F5E2C4] text-[#A46622] w-fit">
              <AlertCircle className="w-5 h-5" />
            </div>
            <h3 className="text-base font-serif font-bold text-[#151515] tracking-tight">
              1. Context windows cannot grow forever
            </h3>
            <p className="text-xs text-[#52504A] font-sans leading-relaxed">
              Standard transformers store every previous token in an expanding KV-cache. Even with quantization and flash attention:
            </p>
            <ul className="space-y-2.5 text-xs text-[#716F68] font-sans">
              <li className="flex items-start gap-2">
                <span className="text-[#A46622] font-bold">•</span>
                <span><strong>Hardware Cost:</strong> Gigabytes of GPU VRAM consumed solely by passive token history.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#A46622] font-bold">•</span>
                <span><strong>Latency & Energy:</strong> Every token generation must attend over millions of historical key-values.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#A46622] font-bold">•</span>
                <span><strong>Attention Decay:</strong> &ldquo;Lost-in-the-middle&rdquo; effects degrade retrieval accuracy as context expands.</span>
              </li>
            </ul>
          </div>

          {/* Pillar 2 */}
          <div className="rounded-2xl border border-[#E5E0D8] bg-[#FFFFFF] p-6 sm:p-7 space-y-4 shadow-xs">
            <div className="p-3 rounded-xl bg-[#EDF7F7] border border-[#CFE8E8] text-[#167C80] w-fit">
              <Database className="w-5 h-5" />
            </div>
            <h3 className="text-base font-serif font-bold text-[#151515] tracking-tight">
              2. Recurrent compression binds memory
            </h3>
            <p className="text-xs text-[#52504A] font-sans leading-relaxed">
              As demonstrated throughout our interactive lab:
            </p>
            <ul className="space-y-2.5 text-xs text-[#716F68] font-sans">
              <li className="flex items-start gap-2">
                <span className="text-[#167C80] font-bold">•</span>
                <span><strong>Bounded Footprint:</strong> A fixed recurrent state operates within constant O(1) memory bounds.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#167C80] font-bold">•</span>
                <span><strong>Fundamental Tension:</strong> Compression inherently forces a trade-off between recall fidelity and coordinate capacity.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#167C80] font-bold">•</span>
                <span><strong>Continuous Ingestion:</strong> The model absorbs incoming information online without rebooting attention passes.</span>
              </li>
            </ul>
          </div>

          {/* Pillar 3 */}
          <div className="rounded-2xl border border-[#E5E0D8] bg-[#FFFFFF] p-6 sm:p-7 space-y-4 shadow-xs">
            <div className="p-3 rounded-xl bg-[#F3EFFF] border border-[#E2D8FA] text-[#6842C2] w-fit">
              <Cpu className="w-5 h-5" />
            </div>
            <h3 className="text-base font-serif font-bold text-[#151515] tracking-tight">
              3. Synapses replace the KV cache
            </h3>
            <p className="text-xs text-[#52504A] font-sans leading-relaxed">
              The biological brain does not maintain a linear tape of every sensory token experienced:
            </p>
            <ul className="space-y-2.5 text-xs text-[#716F68] font-sans">
              <li className="flex items-start gap-2">
                <span className="text-[#6842C2] font-bold">•</span>
                <span><strong>Plastic Connections:</strong> Memory is etched directly into synaptic connections that rewire dynamically during thought.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#6842C2] font-bold">•</span>
                <span><strong>Latent Reasoning:</strong> Multi-step problem solving occurs in recurrent state space without vocalizing verbal scratchpads.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#6842C2] font-bold">•</span>
                <span><strong>Scale-Free Efficiency:</strong> Local Hebbian updates allow parallel execution across sparse connection graphs.</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
};
