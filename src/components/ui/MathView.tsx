import React, { useMemo } from 'react';
import katex from 'katex';

interface MathViewProps {
  math: string;
  block?: boolean;
  className?: string;
  title?: string;
}

export const MathView: React.FC<MathViewProps> = ({ math, block = false, className = '', title }) => {
  const html = useMemo(() => {
    try {
      return katex.renderToString(math.trim(), {
        displayMode: block,
        throwOnError: false,
        strict: false,
      });
    } catch {
      return math;
    }
  }, [math, block]);

  return (
    <span
      title={title}
      className={`katex-wrapper ${
        block
          ? 'block my-3.5 overflow-x-auto py-2 text-center font-serif text-base text-[#151515] bg-[#FAF8F5] border border-[#EAE6DF] rounded-xl px-4'
          : 'inline-block align-baseline mx-0.5 px-0.5'
      } ${className}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
};

export const InlineMath: React.FC<{ math: string; className?: string }> = ({ math, className = '' }) => (
  <MathView math={math} block={false} className={className} />
);

export const BlockMath: React.FC<{ math: string; className?: string }> = ({ math, className = '' }) => (
  <MathView math={math} block={true} className={className} />
);

/**
 * Automatically parses text containing $...$ or $$...$$ or converts known recurrent memory equations
 * into beautifully formatted KaTeX elements with appropriate editorial styling and breathing room.
 */
export const FormattedMathText: React.FC<{ text: string; className?: string }> = ({ text, className = '' }) => {
  const parts = useMemo(() => {
    // 1. Standardize common ASCII formula strings to LaTeX
    let processed = text
      .replace(/M_\(t\+1\)\s*=\s*\\?lambda\s*M_t\s*\+\s*\\?eta\s*k_t\s*v_t\^T/g, '$M_{t+1} = \\lambda M_t + \\eta k_t v_t^T$')
      .replace(/M_\(t\+1\)\s*=\s*λ\s*M_t\s*\+\s*η\s*k_t\s*v_t\^T/g, '$M_{t+1} = \\lambda M_t + \\eta k_t v_t^T$')
      .replace(/M_\(t\+1\)\s*=\s*λ·M_t\s*\+\s*η·k_t·v_t\^T/g, '$M_{t+1} = \\lambda M_t + \\eta k_t v_t^T$')
      .replace(/M_\(t\+1\)\s*=\s*λ\s*M_t\s*\+\s*η\s*k\s*v\^T/g, '$M_{t+1} = \\lambda M_t + \\eta k v^T$')
      .replace(/M\(t\+1\)\s*=\s*λ\s*M\(t\)\s*\+\s*η\s*k\s*v\^T/g, '$M_{t+1} = \\lambda M_t + \\eta k v^T$')
      .replace(/S_\(t\+1\)\s*=\s*f\(S_t,\s*x_t\)/g, '$S_{t+1} = f(S_t, x_t)$')
      .replace(/σ_\(ij,\s*t\+1\)\s*=\s*λ\s*σ_ij\s*\+\s*η\s*x_i\s*y_j/g, '$\\sigma_{ij}(t+1) = \\lambda \\sigma_{ij}(t) + \\eta x_i y_j$')
      .replace(/σ_ij\(t\+1\)\s*=\s*λ\s*σ_ij\(t\)\s*\+\s*η\s*x_i\s*y_j/g, '$\\sigma_{ij}(t+1) = \\lambda \\sigma_{ij}(t) + \\eta x_i y_j$')
      .replace(/v̂\s*=\s*q\^T\s*M/g, '$\\hat{v} = q^T M$')
      .replace(/v̂\s*=\s*q\^T\s*·\s*M_t/g, '$\\hat{v} = q^T M_t$')
      .replace(/\\hat\{v\}\s*=\s*q\^T\s*M/g, '$\\hat{v} = q^T M$')
      .replace(/ΔM_t\s*=\s*M_t\s*-\s*M_\(t-1\)/g, '$\\Delta M_t = M_t - M_{t-1}$')
      .replace(/ΔM_t/g, '$\\Delta M_t$')
      .replace(/S_\{t\+1\}\s*=\s*\\lambda\s*S_t\s*\+\s*\\eta\s*\\cdot\s*\\text\{norm\}\(k_t\)\s*\\cdot\s*\\text\{norm\}\(v_t\)\^T/g, '$S_{t+1} = \\lambda S_t + \\eta \\cdot \\text{norm}(k_t) \\cdot \\text{norm}(v_t)^T$')
      .replace(/ℝ\^\(D\s*×\s*D\)/g, '$\\mathbb{R}^{D \\times D}$')
      .replace(/ℝ\^\(D×D\)/g, '$\\mathbb{R}^{D \\times D}$')
      .replace(/\\lambda\^t/g, '$\\lambda^t$')
      .replace(/λ\^t/g, '$\\lambda^t$')
      .replace(/lambda\s*<\s*1/g, '$\\lambda < 1$')
      .replace(/λ\s*<\s*1/g, '$\\lambda < 1$')
      .replace(/\bO\(T\)\b/g, '$\\mathcal{O}(T)$')
      .replace(/\bO\(1\)\b/g, '$\\mathcal{O}(1)$');

    // 2. Tokenize by $$...$$ (block) and $...$ (inline)
    const blockTokens = processed.split(/(\$\$[\s\S]+?\$\$)/g);
    return blockTokens.map((blockToken, bIdx) => {
      if (blockToken.startsWith('$$') && blockToken.endsWith('$$') && blockToken.length > 4) {
        const mathExpr = blockToken.slice(2, -2);
        return <BlockMath key={`b-${bIdx}`} math={mathExpr} />;
      }

      // Inside normal text or between blocks, split by inline $...$
      const inlineTokens = blockToken.split(/(\$[^$]+?\$)/g);
      return (
        <React.Fragment key={`inline-group-${bIdx}`}>
          {inlineTokens.map((token, iIdx) => {
            if (token.startsWith('$') && token.endsWith('$') && token.length > 2) {
              const mathExpr = token.slice(1, -1);
              return <InlineMath key={`i-${bIdx}-${iIdx}`} math={mathExpr} />;
            }
            return <React.Fragment key={`t-${bIdx}-${iIdx}`}>{token}</React.Fragment>;
          })}
        </React.Fragment>
      );
    });
  }, [text]);

  return <span className={className}>{parts}</span>;
};

